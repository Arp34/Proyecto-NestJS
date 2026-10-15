import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller.js';
import { ProductService } from './product.service.js';
import { jest } from '@jest/globals';

describe('ProductController', () => {
  let controller: ProductController;
  let service: jest.Mocked<ProductService>;

  const mockProduct = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    name: 'Producto Test',
    code: 'PROD-001',
    price: 100,
  };

  const mockProductService = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useFactory: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create (POST)', () => {
    it('debe llamar a service.create y retornar el producto creado', async () => {
      const createDto = { name: 'Producto Test', code: 'PROD-001', price: 100 };
      service.create.mockResolvedValue(mockProduct as any);

      const result = await controller.create(createDto as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll (GET)', () => {
    it('debe llamar a service.findAll y retornar un arreglo de productos', async () => {
      const productsArray = [mockProduct];
      service.findAll.mockResolvedValue(productsArray as any);

      const result = await controller.findAll();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(productsArray);
    });
  });

  describe('findOne (GET :id)', () => {
    it('debe llamar a service.findOne con el ID correspondiente y retornar el producto', async () => {
      service.findOne.mockResolvedValue(mockProduct as any);

      const result = await controller.findOne(mockProduct.id);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.findOne).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update (PATCH :id)', () => {
    it('debe llamar a service.update con el ID y el DTO correspondiente', async () => {
      const updateDto = { price: 150 };
      const updatedProduct = { ...mockProduct, ...updateDto };
      service.update.mockResolvedValue(updatedProduct as any);

      const result = await controller.update(mockProduct.id, updateDto as any);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.update).toHaveBeenCalledWith(
        mockProduct.id,
        expect.objectContaining(updateDto),
      );
      expect(result).toEqual(updatedProduct);
    });
  });

  describe('remove (DELETE :id)', () => {
    it('debe llamar a service.remove con el ID correspondiente y retornar el producto eliminado', async () => {
      service.remove.mockResolvedValue(mockProduct as any);

      const result = await controller.remove(mockProduct.id);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.remove).toHaveBeenCalledWith(mockProduct.id);
      expect(result).toEqual(mockProduct);
    });
  });
});
