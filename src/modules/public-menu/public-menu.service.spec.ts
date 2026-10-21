import {jest} from '@jest/globals';
import { NotFoundException } from '@nestjs/common';
import { PublicMenuService } from './public-menu.service.js';

import { CategoryStatus } from '../categories/enum/category-status.enum.js';
import { productStatus } from '../product/enum/interface.js';

type MenuProduct = {
  id: string;
  name: string;
  status: productStatus;
  availability: string;
};

type MenuCategory = {
  id: string;
  name: string;
  status: CategoryStatus;
  products: MenuProduct[];
};

type MockCategory = {
  id: string;
  name: string;
  status: CategoryStatus;
};

type MockProduct = {
  id: string;
  name: string;
  status: productStatus;
  availability: string;
};


describe('PublicMenuService', () => {
  let service: PublicMenuService;

  let categoryRepository: {
    createQueryBuilder: jest.Mock;
    findOne: jest.Mock<() => Promise<MockCategory | null>>;
  };

  let productRepository: {
    find: jest.Mock<() => Promise<MockProduct[]>>;
  };

  let queryBuilder: {
    leftJoinAndSelect: jest.Mock;
    where: jest.Mock;
    getMany: jest.Mock<() => Promise<MenuCategory[]>>;
  };

  beforeEach(() => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn(),
      where: jest.fn(),
      getMany: jest.fn(),
    };

    queryBuilder.leftJoinAndSelect.mockReturnValue(queryBuilder);
    queryBuilder.where.mockReturnValue(queryBuilder);

    categoryRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      findOne: jest.fn(),
    };

    productRepository = {
      find: jest.fn<() => Promise<MockProduct[]>>(),
    };

    service = new PublicMenuService(
      categoryRepository as any,
      productRepository as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findMenu', () => {
    it('should return the public menu', async () => {
      const menu : MenuCategory[] = [
        {
          id: 'category-1',
          name: 'Hamburguesas',
          status: CategoryStatus.ACTIVE,
          products: [
            {
              id: 'product-1',
              name: 'Hamburguesa clásica',
              status: productStatus.ACTIVE,
              availability: 'AVAILABLE',
            },
          ],
        },
      ];

      queryBuilder.getMany.mockResolvedValue(menu);

      const result = await service.findMenu();

      expect(result).toEqual(menu);
      expect(categoryRepository.createQueryBuilder)
        .toHaveBeenCalledWith('category');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith(
        'category.products',
        'product',
        'product.status = :productStatus',
        { productStatus: productStatus.ACTIVE },
      );
      expect(queryBuilder.where).toHaveBeenCalledWith(
        'category.status = :categoryStatus',
        { categoryStatus: CategoryStatus.ACTIVE },
      );
    });

    it('should return an empty array when no active categories exist', async () => {
      queryBuilder.getMany.mockResolvedValue([]);

      const result = await service.findMenu();

      expect(result).toEqual([]);
    });

    it('should include UNAVAILABLE products if they are ACTIVE', async () => {
      const menu = [
        {
          id: 'category-1',
          name: 'Hamburguesas',
          status: CategoryStatus.ACTIVE,
          products: [
            {
              id: 'product-2',
              name: 'Hamburguesa doble',
              status: productStatus.ACTIVE,
              availability: 'UNAVAILABLE',
            },
          ],
        },
      ];

      queryBuilder.getMany.mockResolvedValue(menu);

      const result = await service.findMenu();

      expect(result[0].products).toHaveLength(1);
      expect(result[0].products[0].availability).toBe('UNAVAILABLE');
    });
  });

  describe('findProductByCategory', () => {
    const categoryId = 'a3481d80-2c7c-4e7f-983f-ec9c900beef9';

    it('should return active products for an active category', async () => {
      const category = {
        id: categoryId,
        name: 'Hamburguesas',
        status: CategoryStatus.ACTIVE,
      };

      const products: MockProduct[] = [
        {
          id: 'product-1',
          name: 'Hamburguesa clásica',
          status: productStatus.ACTIVE,
          availability: 'AVAILABLE',
        },
      ];

      categoryRepository.findOne.mockResolvedValue(category);
      productRepository.find.mockResolvedValue(products);

      const result = await service.findProductByCategory(categoryId);

      expect(result).toEqual(products);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: categoryId,
          status: CategoryStatus.ACTIVE,
        },
      });

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          category: { id: categoryId },
          status: productStatus.ACTIVE,
        },
      });
    });

    it('should return UNAVAILABLE products if their status is ACTIVE', async () => {
      categoryRepository.findOne.mockResolvedValue({
        id: categoryId,
        name: 'Hamburguesas',
        status: CategoryStatus.ACTIVE,
      });

      const products = [
        {
          id: 'product-2',
          name: 'Hamburguesa doble',
          status: productStatus.ACTIVE,
          availability: 'UNAVAILABLE',
        },
      ];

      productRepository.find.mockResolvedValue(products);

      const result = await service.findProductByCategory(categoryId);

      expect(result).toEqual(products);
      expect(result[0].availability).toBe('UNAVAILABLE');
    });

    it('should throw NotFoundException if the category does not exist or is inactive', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findProductByCategory(categoryId),
      ).rejects.toThrow(NotFoundException);

      expect(productRepository.find).not.toHaveBeenCalled();
    });

    it('should return an empty array when the category has no active products', async () => {
      categoryRepository.findOne.mockResolvedValue({
        id: categoryId,
        name: 'Hamburguesas',
        status: CategoryStatus.ACTIVE,
      });

      productRepository.find.mockResolvedValue([]);

      const result = await service.findProductByCategory(categoryId);

      expect(result).toEqual([]);
    });
  });
});