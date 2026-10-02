import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductService } from './product.service.js';
import { Product } from './entities/product.entity.js';
import { jest } from '@jest/globals';

describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<Repository<Product>>;

  const mockProductRepository = () => ({
    find: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    merge: jest.fn((entity: any, ...sources: any[]) =>
      Object.assign(entity, ...sources),
    ),
    remove: jest.fn(),
  });

  const mockProduct = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Producto Test',
    price: 100,
  } as unknown as Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useFactory: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    repository = module.get(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y retornar un producto exitosamente', async () => {
      const createDto = {
        name: 'Producto Test',
        price: 100,
        category_id: 'cat-uuid-123',
      };

      repository.create.mockReturnValue(mockProduct);
      repository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createDto as any);

      expect(repository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: undefined,
        price: createDto.price,
        category: { id: createDto.category_id },
        availability: undefined,
        status: undefined,
        imageUrl: undefined,
      });
      expect(repository.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('debe retornar el arreglo completo de productos', async () => {
      const productsArray = [mockProduct];
      repository.find.mockResolvedValue(productsArray);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(productsArray);
    });
  });

  describe('findOne', () => {
    it('debe retornar un producto exitosamente por su UUID', async () => {
      repository.findOneBy.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockProduct.id });
      expect(result).toEqual(mockProduct);
    });

    it('debe lanzar NotFoundException (404) cuando el producto no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('uuid-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar el producto correctamente mapeando categoría y haciendo merge', async () => {
      const updateDto = { price: 150, category_id: 'cat-uuid-456' };
      const updatedProduct = {
        ...mockProduct,
        price: 150,
      } as unknown as Product;

      repository.findOneBy.mockResolvedValue({ ...mockProduct } as Product);
      repository.save.mockResolvedValue(updatedProduct);

      const result = await service.update(mockProduct.id, updateDto as any);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockProduct.id });
      expect(repository.merge).toHaveBeenCalledWith(
        expect.objectContaining({ category: { id: 'cat-uuid-456' } }),
        { price: 150 },
      );
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedProduct);
    });

    it('debe lanzar NotFoundException (404) si el producto a actualizar no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(
        service.update('uuid-inexistente', { price: 150 } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar el producto exitosamente', async () => {
      repository.findOneBy.mockResolvedValue(mockProduct);
      repository.remove.mockResolvedValue(mockProduct);

      const result = await service.remove(mockProduct.id);

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: mockProduct.id });
      expect(repository.remove).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('debe lanzar NotFoundException (404) si el ID a eliminar no existe', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove('uuid-inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
