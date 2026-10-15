import { describe, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TablesService } from './tables.service.js';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Table } from './entities/table.entity.js';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';
import { TableStatus } from './enums/table-status.enum.js';

describe('TablesService', () => {
  let service: TablesService;

  const mockTableId = '123e4567-e89b-12d3-a456-426614174000';
  const mockTable = { id: mockTableId, number: 1, capacity: 4 };

  let mockTableRepository: any;

  beforeEach(async () => {
    mockTableRepository = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      preload: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TablesService,
        {
          provide: getRepositoryToken(Table),
          useValue: mockTableRepository,
        },
      ],
    }).compile();

    service = module.get<TablesService>(TablesService);
  });

  it('el servicio debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear y retornar una mesa si el número no existe', async () => {
      const dto: CreateTableDto = { number: 1, capacity: 4, zone: 'Terraza' };

      mockTableRepository.findOne.mockResolvedValue(null);
      mockTableRepository.create.mockReturnValue(mockTable);
      mockTableRepository.save.mockResolvedValue(mockTable);

      const result = await service.create(dto);

      expect(mockTableRepository.findOne).toHaveBeenCalledWith({
        where: { number: dto.number },
      });
      expect(mockTableRepository.create).toHaveBeenCalledWith(dto);
      expect(mockTableRepository.save).toHaveBeenCalledWith(mockTable);
      expect(result).toEqual(mockTable);
    });

    it('debe lanzar ConflictException si el número de mesa ya existe', async () => {
      const dto: CreateTableDto = { number: 1, capacity: 4, zone: 'Terraza' };

      mockTableRepository.findOne.mockResolvedValue(mockTable);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(mockTableRepository.create).not.toHaveBeenCalled();
      expect(mockTableRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debe retornar un arreglo de todas las mesas', async () => {
      mockTableRepository.find.mockResolvedValue([mockTable]);

      const result = await service.findAll();

      expect(mockTableRepository.find).toHaveBeenCalled();
      expect(result).toEqual([mockTable]);
    });
  });

  describe('findOne', () => {
    it('debe retornar una mesa si el ID es encontrado', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(mockTable);

      const result = await service.findOne(mockTableId);

      expect(mockTableRepository.findOneBy).toHaveBeenCalledWith({
        id: mockTableId,
      });
      expect(result).toEqual(mockTable);
    });

    it('debe lanzar NotFoundException si el ID no es encontrado', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(mockTableId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar una mesa si existe', async () => {
      const dto: UpdateTableDto = { capacity: 6 };
      const updatedTable = { ...mockTable, capacity: 6 };

      mockTableRepository.preload.mockResolvedValue(updatedTable);
      mockTableRepository.save.mockResolvedValue(updatedTable);

      const result = await service.update(mockTableId, dto);

      expect(mockTableRepository.preload).toHaveBeenCalledWith(
        Object.assign({ id: mockTableId }, dto),
      );
      expect(mockTableRepository.save).toHaveBeenCalledWith(updatedTable);
      expect(result).toEqual(updatedTable);
    });

    it('debe lanzar NotFoundException si no se puede precargar la mesa para actualizar', async () => {
      const dto: UpdateTableDto = { capacity: 6 };
      mockTableRepository.preload.mockResolvedValue(null);

      await expect(service.update(mockTableId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTableRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('debe eliminar la mesa si existe', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(mockTable);
      mockTableRepository.remove.mockResolvedValue(mockTable);

      await service.remove(mockTableId);

      expect(mockTableRepository.findOneBy).toHaveBeenCalledWith({
        id: mockTableId,
      });
      expect(mockTableRepository.remove).toHaveBeenCalledWith(mockTable);
    });

    it('debe lanzar NotFoundException si se intenta eliminar una mesa que no existe', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(mockTableId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockTableRepository.remove).not.toHaveBeenCalled();
    });
  });

  // NUEVO
  describe('updateStatus', () => {
    it('debe cambiar el estado de la mesa y guardarla', async () => {
      const table = { ...mockTable, status: TableStatus.AVAILABLE };
      const saved = { ...table, status: TableStatus.OCCUPIED };

      mockTableRepository.findOneBy.mockResolvedValue(table);
      mockTableRepository.save.mockResolvedValue(saved);

      const result = await service.updateStatus(
        mockTableId,
        TableStatus.OCCUPIED,
      );

      expect(mockTableRepository.findOneBy).toHaveBeenCalledWith({
        id: mockTableId,
      });
      expect(mockTableRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TableStatus.OCCUPIED }),
      );
      expect(result.status).toBe(TableStatus.OCCUPIED);
    });

    it('debe lanzar NotFoundException si la mesa no existe', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.updateStatus(mockTableId, TableStatus.OCCUPIED),
      ).rejects.toThrow(NotFoundException);
      expect(mockTableRepository.save).not.toHaveBeenCalled();
    });
  });

  // NUEVO
  describe('assertTableUsable', () => {
    it('debe retornar la mesa si está disponible', async () => {
      const table = { ...mockTable, status: TableStatus.AVAILABLE };
      mockTableRepository.findOneBy.mockResolvedValue(table);

      const result = await service.assertTableUsable(mockTableId);

      expect(result).toEqual(table);
    });

    it('debe lanzar ConflictException si la mesa está OUT_OF_SERVICE (RN-019)', async () => {
      const table = { ...mockTable, status: TableStatus.OUT_OF_SERVICE };
      mockTableRepository.findOneBy.mockResolvedValue(table);

      await expect(service.assertTableUsable(mockTableId)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe lanzar NotFoundException si la mesa no existe', async () => {
      mockTableRepository.findOneBy.mockResolvedValue(null);

      await expect(service.assertTableUsable(mockTableId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
