import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AuthService } from './auth.service.js';
import { CustomersService } from '../customers/customers.service.js';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { CustomerStatus } from '../customers/entities/customer.entity.js';
import * as bcrypt from 'bcrypt';

const mockCustomersService = () => ({
  findByEmail: (jest.fn() as any).mockResolvedValue(null),
  setResetPasswordToken: (jest.fn() as any).mockResolvedValue(null),
  resetPasswordWithToken: (jest.fn() as any).mockResolvedValue({
    message: 'Contraseña restablecida',
  }),
});

const mockJwtService = () => ({
  signAsync: (jest.fn() as any).mockResolvedValue('mock_token'),
});

describe('AuthService', () => {
  let service: AuthService;
  let customersService: CustomersService;
  let hashedPassword: string;

  beforeAll(async () => {
    // Generamos un hash real y rápido para las pruebas usando bcrypt
    hashedPassword = await bcrypt.hash('password123', 4);
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: CustomersService, useFactory: mockCustomersService },
        { provide: JwtService, useFactory: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    customersService = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should throw UnauthorizedException if customer is not found', async () => {
      (customersService.findByEmail as any).mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: '123' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if customer is not active', async () => {
      const mockCustomer = {
        id: '1',
        email: 'test@test.com',
        password: hashedPassword,
        status: CustomerStatus.INACTIVE,
        role: 'customer',
      };
      (customersService.findByEmail as any).mockResolvedValue(mockCustomer);

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'password123',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockCustomer = {
        id: '1',
        email: 'test@test.com',
        password: hashedPassword,
        status: CustomerStatus.ACTIVE,
        role: 'customer',
      };
      (customersService.findByEmail as any).mockResolvedValue(mockCustomer);

      await expect(
        service.login({
          email: 'test@test.com',
          password: 'wrongpassword',
        } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token and user info on successful login', async () => {
      const mockCustomer = {
        id: '1',
        name: 'Juan',
        email: 'test@test.com',
        password: hashedPassword,
        status: CustomerStatus.ACTIVE,
        role: 'customer',
      };
      (customersService.findByEmail as any).mockResolvedValue(mockCustomer);

      const result = await service.login({
        email: 'test@test.com',
        password: 'password123',
      } as any);

      expect(result).toHaveProperty('access_token', 'mock_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toEqual(mockCustomer.email);
    });
  });

  describe('forgotPassword', () => {
    it('should return generic message even if customer is not found (anti-enumeration)', async () => {
      (customersService.findByEmail as any).mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'notfound@test.com',
      });
      expect(result).toEqual({
        message: 'Si el correo está registrado, recibirás las instrucciones',
      });
    });

    it('should generate token and save it if customer exists', async () => {
      const mockCustomer = { id: '1', email: 'test@test.com' };
      (customersService.findByEmail as any).mockResolvedValue(mockCustomer);

      const result = await service.forgotPassword({ email: 'test@test.com' });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(customersService.setResetPasswordToken).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Si el correo está registrado, recibirás las instrucciones',
      });
    });
  });

  describe('resetPassword', () => {
    it('should delegate reset password to customersService successfully', async () => {
      (customersService.resetPasswordWithToken as any).mockResolvedValue({
        message: 'Contraseña restablecida',
      });

      const result = await service.resetPassword({
        token: 'valid_token',
        newPassword: 'newpassword123',
      });

      expect(result).toEqual({ message: 'Contraseña restablecida' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(customersService.resetPasswordWithToken).toHaveBeenCalledWith(
        'valid_token',
        'newpassword123',
      );
    });
  });
});
