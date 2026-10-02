import { jest } from '@jest/globals';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from '../customers/entities/customer.entity.js';
import { Table } from '../tables/entities/table.entity.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import {
  Reservation,
  ReservationStatus,
} from './entities/reservation.entity.js';
import { ReservationsService } from './reservations.service.js';

type AsyncMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;
type SyncMock = jest.Mock<(...args: unknown[]) => unknown>;

interface MockRepository {
  find: AsyncMock;
  findOne: AsyncMock;
  findOneBy: AsyncMock;
  create: SyncMock;
  save: AsyncMock;
  preload: AsyncMock;
  remove: AsyncMock;
  delete: AsyncMock;
}

const createMockRepository = (): MockRepository => ({
  find: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  findOneBy: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  create: jest.fn<(...args: unknown[]) => unknown>(),
  save: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  preload: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  remove: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  delete: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
});

describe('ReservationsService', () => {
  let service: ReservationsService;
  let reservationsRepo: MockRepository;
  let tablesRepo: MockRepository;
  let customersRepo: MockRepository;

  const reservationId = '3f6c1b0e-8a47-4d0a-9a43-2d1f8e5b7c11';
  const FUTURE_DATE = '2099-12-31';
  const PAST_DATE = '2000-01-01';

  const buildCreateDto = (
    overrides: Record<string, unknown> = {},
  ): CreateReservationDto =>
    ({
      customer_id: 'customer-1',
      table_id: 'table-1',
      date: FUTURE_DATE,
      time: '20:00',
      guests: 4,
      notes: 'Cumpleaños',
      ...overrides,
    }) as unknown as CreateReservationDto;

  const buildReservation = (): Reservation =>
    ({
      id: reservationId,
      customer_id: 'customer-1',
      table_id: 'table-1',
      date: FUTURE_DATE,
      time: '20:00',
      guests: 2,
      status: ReservationStatus.PENDING,
    }) as unknown as Reservation;

  const mockTable = { id: 'table-1', capacity: 4 } as unknown as Table;
  const mockCustomer = { id: 'customer-1' } as unknown as Customer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Table),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationsRepo = module.get(getRepositoryToken(Reservation));
    tablesRepo = module.get(getRepositoryToken(Table));
    customersRepo = module.get(getRepositoryToken(Customer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  //  create
  describe('create', () => {
    it('debe crear una reserva con mesa cuando todo es válido', async () => {
      const dto = buildCreateDto();
      const created = { id: reservationId } as unknown as Reservation;
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      tablesRepo.findOne.mockResolvedValue(mockTable);
      reservationsRepo.findOne.mockResolvedValue(null); // sin conflicto
      reservationsRepo.create.mockReturnValue(created);
      reservationsRepo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(reservationsRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 'customer-1',
          table_id: 'table-1',
          status: ReservationStatus.PENDING,
        }),
      );
      expect(reservationsRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });

    it('debe crear una reserva sin mesa y no validar la mesa', async () => {
      const dto = buildCreateDto({ table_id: undefined });
      const created = { id: reservationId } as unknown as Reservation;
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.create.mockReturnValue(created);
      reservationsRepo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(tablesRepo.findOne).not.toHaveBeenCalled();
      expect(reservationsRepo.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(created);
    });

    it('debe lanzar BadRequestException (400) si la fecha es pasada', async () => {
      const dto = buildCreateDto({ date: PAST_DATE });

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException (404) si el cliente no existe', async () => {
      customersRepo.findOne.mockResolvedValue(null);

      await expect(service.create(buildCreateDto())).rejects.toThrow(
        NotFoundException,
      );
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException (404) si la mesa no existe', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      tablesRepo.findOne.mockResolvedValue(null);

      await expect(service.create(buildCreateDto())).rejects.toThrow(
        NotFoundException,
      );
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException (409) si los invitados superan la capacidad', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      tablesRepo.findOne.mockResolvedValue(mockTable);

      await expect(
        service.create(buildCreateDto({ guests: 10 })),
      ).rejects.toThrow(ConflictException);
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException (409) si la mesa ya está reservada a esa fecha y hora', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      tablesRepo.findOne.mockResolvedValue(mockTable);
      reservationsRepo.findOne.mockResolvedValue(buildReservation());

      await expect(service.create(buildCreateDto())).rejects.toThrow(
        ConflictException,
      );
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });
  });

  // findAll
  describe('findAll', () => {
    it('debe retornar el arreglo completo de reservas', async () => {
      const reservations = [buildReservation(), buildReservation()];
      reservationsRepo.find.mockResolvedValue(reservations);

      const result = await service.findAll();

      expect(reservationsRepo.find).toHaveBeenCalled();
      expect(result).toEqual(reservations);
      expect(result).toHaveLength(2);
    });

    it('debe retornar un arreglo vacío si no hay reservas', async () => {
      reservationsRepo.find.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });
  });

  //  findOne
  describe('findOne', () => {
    it('debe retornar la reserva cuando el UUID existe', async () => {
      const reservation = buildReservation();
      reservationsRepo.findOne.mockResolvedValue(reservation);

      const result = await service.findOne(reservationId);

      expect(reservationsRepo.findOne).toHaveBeenCalledWith({
        where: { id: reservationId },
      });
      expect(result).toEqual(reservation);
    });

    it('debe lanzar NotFoundException (404) cuando la reserva no existe', async () => {
      reservationsRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(reservationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // update
  describe('update', () => {
    it('debe actualizar la reserva cuando los datos son válidos', async () => {
      const dto = { guests: 3 } as unknown as UpdateReservationDto;
      reservationsRepo.findOne
        .mockResolvedValueOnce(buildReservation()) // findOne(id)
        .mockResolvedValueOnce(null); // sin conflicto
      tablesRepo.findOne.mockResolvedValue(mockTable);
      reservationsRepo.save.mockImplementation((entity) =>
        Promise.resolve(entity),
      );

      const result = await service.update(reservationId, dto);

      expect(reservationsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ id: reservationId, guests: 3 }),
      );
      expect(result).toEqual(expect.objectContaining({ guests: 3 }));
    });

    it('debe lanzar NotFoundException (404) si la reserva no existe', async () => {
      reservationsRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(reservationId, {} as unknown as UpdateReservationDto),
      ).rejects.toThrow(NotFoundException);
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException (400) si la nueva fecha es pasada', async () => {
      reservationsRepo.findOne.mockResolvedValue(buildReservation());
      const dto = { date: PAST_DATE } as unknown as UpdateReservationDto;

      await expect(service.update(reservationId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException (404) si el nuevo cliente no existe', async () => {
      reservationsRepo.findOne.mockResolvedValue(buildReservation());
      customersRepo.findOne.mockResolvedValue(null);
      const dto = { customer_id: 'otro' } as unknown as UpdateReservationDto;

      await expect(service.update(reservationId, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ConflictException (409) si los invitados superan la capacidad', async () => {
      reservationsRepo.findOne.mockResolvedValue(buildReservation());
      tablesRepo.findOne.mockResolvedValue(mockTable);
      const dto = { guests: 10 } as unknown as UpdateReservationDto;

      await expect(service.update(reservationId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictException (409) si el nuevo horario choca con otra reserva', async () => {
      reservationsRepo.findOne
        .mockResolvedValueOnce(buildReservation()) // findOne(id)
        .mockResolvedValueOnce({ id: 'otra-reserva' }); // conflicto
      const dto = { time: '21:00' } as unknown as UpdateReservationDto;

      await expect(service.update(reservationId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(reservationsRepo.save).not.toHaveBeenCalled();
    });
  });

  //  remove
  describe('remove', () => {
    it('debe eliminar la reserva existente', async () => {
      reservationsRepo.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.remove(reservationId)).resolves.toBeUndefined();
      expect(reservationsRepo.delete).toHaveBeenCalledWith(reservationId);
    });

    it('debe lanzar NotFoundException (404) si el ID no existe', async () => {
      reservationsRepo.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.remove(reservationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});