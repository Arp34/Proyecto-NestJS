import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { CustomersService } from '../customers/customers.service.js';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import {
  CustomerStatus,
  CustomerRole,
} from '../customers/entities/customer.entity.js';
import * as bcrypt from 'bcrypt';

const mockCustomersService = () => ({
  findByEmailForAuth: jest.fn(),
  setResetPasswordToken: jest.fn(),
  findByResetToken: jest.fn(),
  resetPasswordWithToken: jest.fn(),
});

const mockJwtService = () => ({
  signAsync: jest.fn().mockResolvedValue('mock_token'),
});

describe('AuthService', () => {
  let service: AuthService;
  let customersService: CustomersService;

  beforeEach(async () => {
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
      jest
        .spyOn(customersService, 'findByEmailForAuth')
        .mockResolvedValue(null);

      await expect(
        service.login({ email: 'test@test.com', password: '123' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if customer is not active', async () => {
      const mockCustomer = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed_password',
        status: CustomerStatus.INACTIVE,
        role: CustomerRole.CUSTOMER,
      };
      jest
        .spyOn(customersService, 'findByEmailForAuth')
        .mockResolvedValue(mockCustomer as any);

      await expect(
        service.login({ email: 'test@test.com', password: '123' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const mockCustomer = {
        id: '1',
        email: 'test@test.com',
        password: 'hashed_password',
        status: CustomerStatus.ACTIVE,
        role: CustomerRole.CUSTOMER,
      };
      jest
        .spyOn(customersService, 'findByEmailForAuth')
        .mockResolvedValue(mockCustomer as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' } as any),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return access token and user info on successful login', async () => {
      const mockCustomer = {
        id: '1',
        name: 'Juan',
        email: 'test@test.com',
        password: 'hashed_password',
        status: CustomerStatus.ACTIVE,
        role: CustomerRole.CUSTOMER,
      };
      jest
        .spyOn(customersService, 'findByEmailForAuth')
        .mockResolvedValue(mockCustomer as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

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
      jest
        .spyOn(customersService, 'findByEmailForAuth')
        .mockResolvedValue(null);

      const result = await service.forgotPassword({
        email: 'notfound@test.com',
      });
      expect(result).toEqual({
        message: 'Si el correo está registrado, recibirás las instrucciones',
      });
    });

    it('should generate token and save it if customer exists', async () => {
      const mockCustomer = { id: '1', email: 'test@test.com' };
      jest
        .spyOn(customersService, 'findByEmailForAuth')
        .mockResolvedValue(mockCustomer as any);

      const result = await service.forgotPassword({ email: 'test@test.com' });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(customersService.setResetPasswordToken).toHaveBeenCalled();

      expect(result).toEqual({
        message: 'Si el correo está registrado, recibirás las instrucciones',
      });
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException if token is invalid or expired info is missing', async () => {
      jest.spyOn(customersService, 'findByResetToken').mockResolvedValue(null);

      await expect(
        service.resetPassword({ token: 'invalid_token', newPassword: '123' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if token has expired', async () => {
      const expiredDate = new Date(Date.now() - 1000);
      const mockCustomer = {
        id: '1',
        resetPasswordToken: 'valid_token',
        resetPasswordExpires: expiredDate,
      };
      jest
        .spyOn(customersService, 'findByResetToken')
        .mockResolvedValue(mockCustomer as any);

      await expect(
        service.resetPassword({
          token: 'valid_token',
          newPassword: 'newpassword123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
