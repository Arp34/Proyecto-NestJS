import { jest } from '@jest/globals';
import { GUARDS_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { ROLES_KEY } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { ReservationsController } from './reservations.controller.js';
import { ReservationsService } from './reservations.service.js';

type LifecycleMock = jest.Mock<(id: string) => Promise<unknown>>;

describe('ReservationsController', () => {
  let controller: ReservationsController;

  const reservationId = '3f6c1b0e-8a47-4d0a-9a43-2d1f8e5b7c11';
  const reservation = { id: reservationId };
  const mockService: Record<
    'confirm' | 'checkIn' | 'markNoShow',
    LifecycleMock
  > = {
    confirm: jest.fn<(id: string) => Promise<unknown>>(),
    checkIn: jest.fn<(id: string) => Promise<unknown>>(),
    markNoShow: jest.fn<(id: string) => Promise<unknown>>(),
  };

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

  it.each([
    ['confirm', 'confirm', ':id/confirm'],
    ['checkIn', 'checkIn', ':id/check-in'],
    ['markNoShow', 'markNoShow', ':id/no-show'],
  ] as const)(
    'expone %s con autenticación JWT y roles ADMIN/WAITER',
    async (method, serviceMethod, routePath) => {
      const handler = ReservationsController.prototype[method];
      const guards = Reflect.getMetadata(GUARDS_METADATA, handler);
      const roles = Reflect.getMetadata(ROLES_KEY, handler);
      mockService[serviceMethod].mockResolvedValue(reservation);

      const result = await controller[method](reservationId);

      expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(routePath);
      expect(guards).toEqual([JwtAuthGuard, RolesGuard]);
      expect(roles).toEqual(['ADMIN', 'WAITER']);
      expect(mockService[serviceMethod]).toHaveBeenCalledWith(reservationId);
      expect(result).toBe(reservation);
    },
  );
});
