import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { CategoryStatus } from './enum/category-status.enum.js';
import { jest } from '@jest/globals';
import { Category } from './entities/category.entity.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  // Fake implementations estrictas para el controlador
  const mockCategoriesService = {
    create: jest.fn(async (): Promise<Category> => ({}) as Category),
    findAll: jest.fn(async (): Promise<Category[]> => []),
    findOne: jest.fn(async (): Promise<Category> => ({}) as Category),
    update: jest.fn(async (): Promise<Category> => ({}) as Category),
    updateStatus: jest.fn(async (): Promise<Category> => ({}) as Category),
    remove: jest.fn(async (): Promise<Category> => ({}) as Category),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('debe invocar create del servicio', async () => {
    const dto = { name: 'Test', status: CategoryStatus.ACTIVE };
    await controller.create(dto as any);
    expect(mockCategoriesService.create).toHaveBeenCalledWith(dto);
  });

  it('debe invocar findAll del servicio', async () => {
    await controller.findAll();
    expect(mockCategoriesService.findAll).toHaveBeenCalled();
  });

  it('debe invocar findOne del servicio', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    await controller.findOne(id);
    expect(mockCategoriesService.findOne).toHaveBeenCalledWith(id);
  });

  it('debe invocar update del servicio', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const dto = { name: 'Updated' };
    await controller.update(id, dto as any);
    expect(mockCategoriesService.update).toHaveBeenCalledWith(id, dto);
  });

  it('debe invocar updateStatus del servicio', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    const dto = { status: CategoryStatus.INACTIVE };
    await controller.updateStatus(id, dto as any);
    expect(mockCategoriesService.updateStatus).toHaveBeenCalledWith(id, dto);
  });

  it('debe invocar remove del servicio', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000';
    await controller.remove(id);
    expect(mockCategoriesService.remove).toHaveBeenCalledWith(id);
  });
});
