import { jest } from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import { Customer } from '../customers/entities/customer.entity.js';
import { Table, tableStatus } from '../tables/entities/table.entity.js';
import {
  Reservation,
  ReservationStatus,
} from './entities/reservation.entity.js';
import { ReservationsService } from './reservations.service.js';

type AsyncMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

interface MockRepository {
  findOne: AsyncMock;
  save: AsyncMock;
}

interface MockEntityManager {
  findOne: AsyncMock;
  save: AsyncMock;
}

const createMockRepository = (): MockRepository => ({
  findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  save: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
});

describe('ReservationsService lifecycle', () => {
  let service: ReservationsService;
  let reservationRepo: MockRepository;
  let manager: MockEntityManager;
  let transaction: AsyncMock;

  const reservationId = '3f6c1b0e-8a47-4d0a-9a43-2d1f8e5b7c11';

  const buildTable = (status: tableStatus = tableStatus.AVAILABLE) =>
    ({
      id: 'table-1',
      number: 12,
      capacity: 4,
      status,
    }) as Table;

  const buildReservation = (
    status: ReservationStatus = ReservationStatus.PENDING,
    table?: Table,
  ) =>
    ({
      id: reservationId,
      customer_id: 'customer-1',
      table_id: table?.id,
      table,
      date: '2099-12-31',
      time: '20:00',
      guests: 2,
      status,
    }) as Reservation;

  beforeEach(async () => {
    reservationRepo = createMockRepository();
    manager = {
      findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
      save: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    };
    manager.save.mockImplementation((entity) => Promise.resolve(entity));
    transaction = jest.fn<(...args: unknown[]) => Promise<unknown>>();
    transaction.mockImplementation((callback) =>
      (callback as (entityManager: EntityManager) => Promise<unknown>)(
        manager as unknown as EntityManager,
      ),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        { provide: getRepositoryToken(Reservation), useValue: reservationRepo },
        {
          provide: getRepositoryToken(Table),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: createMockRepository(),
        },
        { provide: DataSource, useValue: { transaction } },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('confirm', () => {
    it('confirma una reserva pendiente y guarda la fecha de confirmación', async () => {
      reservationRepo.findOne.mockResolvedValue(buildReservation());
      reservationRepo.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.confirm(reservationId);

      expect(reservationRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ReservationStatus.CONFIRMED,
          confirmed_at: expect.any(Date),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({ status: ReservationStatus.CONFIRMED }),
      );
    });

    it('rechaza estados distintos de PENDING', async () => {
      reservationRepo.findOne.mockResolvedValue(
        buildReservation(ReservationStatus.CANCELLED),
      );

      await expect(service.confirm(reservationId)).rejects.toThrow(
        ConflictException,
      );
      expect(reservationRepo.save).not.toHaveBeenCalled();
    });

    it('devuelve 404 si la reserva no existe', async () => {
      reservationRepo.findOne.mockResolvedValue(null);

      await expect(service.confirm(reservationId)).rejects.toThrow(
        new NotFoundException(`Reserva con id ${reservationId} no encontrada`),
      );
    });
  });

  describe('checkIn', () => {
    it('registra la llegada y ocupa la mesa', async () => {
      const table = buildTable();
      manager.findOne.mockResolvedValue(
        buildReservation(ReservationStatus.CONFIRMED, table),
      );

      const result = await service.checkIn(reservationId);

      expect(manager.findOne).toHaveBeenCalledWith(Reservation, {
        where: { id: reservationId },
        relations: { table: true },
      });
      expect(manager.save).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ status: tableStatus.OCCUPIED }),
      );
      expect(manager.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          status: ReservationStatus.CHECKED_IN,
          checked_in_at: expect.any(Date),
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({ status: ReservationStatus.CHECKED_IN }),
      );
    });

    it('interpela el ID al lanzar 404 cuando no existe la reserva', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.checkIn(reservationId)).rejects.toThrow(
        new NotFoundException(`Reserva con id ${reservationId} no encontrada`),
      );
    });

    it('interpela el número de mesa cuando la mesa ya está ocupada', async () => {
      const table = buildTable(tableStatus.OCCUPIED);
      manager.findOne.mockResolvedValue(
        buildReservation(ReservationStatus.CONFIRMED, table),
      );

      await expect(service.checkIn(reservationId)).rejects.toThrow(
        new ConflictException('La mesa 12 ya esta ocupada'),
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza reservas que no estén confirmadas', async () => {
      manager.findOne.mockResolvedValue(
        buildReservation(ReservationStatus.PENDING, buildTable()),
      );

      await expect(service.checkIn(reservationId)).rejects.toThrow(
        ConflictException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('rechaza reservas sin mesa asignada', async () => {
      manager.findOne.mockResolvedValue(
        buildReservation(ReservationStatus.CONFIRMED),
      );

      await expect(service.checkIn(reservationId)).rejects.toThrow(
        BadRequestException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });
  });

  describe('markNoShow', () => {
    it('marca ausente una reserva confirmada y libera su mesa', async () => {
      const table = buildTable(tableStatus.RESERVED);
      manager.findOne.mockResolvedValue(
        buildReservation(ReservationStatus.CONFIRMED, table),
      );

      const result = await service.markNoShow(reservationId);

      expect(manager.save).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ status: tableStatus.AVAILABLE }),
      );
      expect(manager.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ status: ReservationStatus.NO_SHOW }),
      );
      expect(result).toEqual(
        expect.objectContaining({ status: ReservationStatus.NO_SHOW }),
      );
    });

    it('permite marcar ausente una reserva pendiente', async () => {
      manager.findOne.mockResolvedValue(buildReservation());

      await expect(service.markNoShow(reservationId)).resolves.toEqual(
        expect.objectContaining({ status: ReservationStatus.NO_SHOW }),
      );
    });

    it('rechaza estados no permitidos', async () => {
      manager.findOne.mockResolvedValue(
        buildReservation(ReservationStatus.CHECKED_IN),
      );

      await expect(service.markNoShow(reservationId)).rejects.toThrow(
        ConflictException,
      );
      expect(manager.save).not.toHaveBeenCalled();
    });

    it('devuelve 404 si la reserva no existe', async () => {
      manager.findOne.mockResolvedValue(null);

      await expect(service.markNoShow(reservationId)).rejects.toThrow(
        new NotFoundException(`Reserva con id ${reservationId} no encontrada`),
      );
    });
  });
});
