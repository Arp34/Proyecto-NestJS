import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity.js';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoryStatus } from './enum/category-status.enum.js';
import { jest } from '@jest/globals';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategoryRepository = {
    find: jest.fn(async (): Promise<Category[]> => []),
    findOne: jest.fn(async (): Promise<Category | null> => null),
    findOneBy: jest.fn(async (): Promise<Category | null> => null),
    create: jest.fn((dto: Partial<Category>): Category => dto as Category),
    save: jest.fn(
      async (entity: Partial<Category>): Promise<Category> =>
        entity as Category,
    ),
    remove: jest.fn(async (entity: Category): Promise<Category> => entity),
    merge: jest.fn((entity: Category, dto: Partial<Category>) =>
      Object.assign(entity, dto),
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Postres',
      description: 'Ricos',
      status: CategoryStatus.ACTIVE,
    };

    it('debe crear una categoría exitosamente', async () => {
      mockCategoryRepository.findOne.mockResolvedValue(null);

      // Usamos "as Category" para que TS apruebe nuestro dato falso
      mockCategoryRepository.create.mockReturnValue(createDto as Category);
      mockCategoryRepository.save.mockResolvedValue({
        id: '1',
        ...createDto,
      } as Category);

      const result = await service.create(createDto as any); // Cast ignorado en tests

      expect(result).toEqual({ id: '1', ...createDto });
      expect(mockCategoryRepository.save).toHaveBeenCalled();
    });

    it('debe lanzar 409 ConflictException si el nombre ya existe', async () => {
      mockCategoryRepository.findOne.mockResolvedValue({
        id: '2',
        name: 'Postres',
      } as Category);
      await expect(service.create(createDto as any)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar la lista de categorías activas', async () => {
      const mockData = [
        { id: '1', name: 'Postres', status: CategoryStatus.ACTIVE } as Category,
      ];
      mockCategoryRepository.find.mockResolvedValue(mockData);

      const result = await service.findAll();
      expect(result).toEqual(mockData);
    });
  });

  describe('findOne', () => {
    it('debe retornar una categoría por su ID', async () => {
      const mockCategory = { id: '1', name: 'Postres' } as Category;
      mockCategoryRepository.findOneBy.mockResolvedValue(mockCategory);

      const result = await service.findOne('1');
      expect(result).toEqual(mockCategory);
    });

    it('debe lanzar 404 NotFoundException si no existe', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Nuevos Postres' };
    const existingCategory = { id: '1', name: 'Postres' } as Category;

    it('debe actualizar exitosamente', async () => {
      mockCategoryRepository.findOneBy.mockResolvedValue(existingCategory);
      mockCategoryRepository.findOne.mockResolvedValue(null);
      mockCategoryRepository.save.mockResolvedValue(
        Object.assign({}, existingCategory, updateDto) as Category,
      );
      const result = await service.update('1', updateDto);

      expect(mockCategoryRepository.save).toHaveBeenCalled();
      expect(result.name).toEqual('Nuevos Postres');
    });
  });

  describe('updateStatus', () => {
    it('debe actualizar el estado exitosamente', async () => {
      const existingCategory = {
        id: '1',
        name: 'Postres',
        status: CategoryStatus.ACTIVE,
      } as Category;
      const statusDto = { status: CategoryStatus.INACTIVE };

      mockCategoryRepository.findOneBy.mockResolvedValue(existingCategory);
      mockCategoryRepository.save.mockResolvedValue(
        Object.assign({}, existingCategory, statusDto) as Category,
      );
      const result = await service.updateStatus('1', statusDto as any);
      expect(result.status).toEqual(CategoryStatus.INACTIVE);
    });
  });

  describe('remove', () => {
    it('debe eliminar exitosamente', async () => {
      const existingCategory = { id: '1', name: 'Postres' } as Category;
      mockCategoryRepository.findOneBy.mockResolvedValue(existingCategory);
      mockCategoryRepository.remove.mockResolvedValue(existingCategory);

      const result = await service.remove('1');
      expect(mockCategoryRepository.remove).toHaveBeenCalledWith(
        existingCategory,
      );
      expect(result).toEqual(existingCategory);
    });
  });
});
