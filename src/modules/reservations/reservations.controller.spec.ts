import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';

type AsyncMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const mockService: Record<
    'create' | 'findAll' | 'findOne' | 'update' | 'remove',
    AsyncMock
  > = {
    create: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findAll: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    findOne: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    update: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
    remove: jest.fn<(...args: unknown[]) => Promise<unknown>>(),
  };

  const reservationId = '3f6c1b0e-8a47-4d0a-9a43-2d1f8e5b7c11';
  const createDto = {
    customer_id: 'customer-1',
    table_id: 'table-1',
    date: '2099-12-31',
    time: '20:00',
    guests: 4,
  } as unknown as CreateReservationDto;
  const updateDto = { guests: 3 } as unknown as UpdateReservationDto;
  const reservation = { id: reservationId };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [{ provide: ReservationsService, useValue: mockService }],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('POST: debe llamar a service.create con el DTO', async () => {
    mockService.create.mockResolvedValue(reservation);

    const result = await controller.create(createDto);

    expect(mockService.create).toHaveBeenCalledWith(createDto);
    expect(result).toEqual(reservation);
  });

  it('GET: debe llamar a service.findAll', async () => {
    mockService.findAll.mockResolvedValue([reservation]);

    const result = await controller.findAll();

    expect(mockService.findAll).toHaveBeenCalled();
    expect(result).toEqual([reservation]);
  });

  it('GET /:id: debe llamar a service.findOne con el id', async () => {
    mockService.findOne.mockResolvedValue(reservation);

    const result = await controller.findOne(reservationId);

    expect(mockService.findOne).toHaveBeenCalledWith(reservationId);
    expect(result).toEqual(reservation);
  });

  it('PATCH /:id: debe llamar a service.update con id y DTO', async () => {
    mockService.update.mockResolvedValue(reservation);

    const result = await controller.update(reservationId, updateDto);

    expect(mockService.update).toHaveBeenCalledWith(reservationId, updateDto);
    expect(result).toEqual(reservation);
  });

  it('DELETE /:id: debe llamar a service.remove con el id', async () => {
    mockService.remove.mockResolvedValue(undefined);

    await controller.remove(reservationId);

    expect(mockService.remove).toHaveBeenCalledWith(reservationId);
  });
});