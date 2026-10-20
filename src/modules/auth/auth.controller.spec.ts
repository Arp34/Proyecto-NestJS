import { Test, TestingModule } from '@nestjs/testing';
import { jest } from '@jest/globals';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';

const mockAuthService = () => ({
  login: (jest.fn() as any).mockResolvedValue({ access_token: 'mock_token' }),
  forgotPassword: (jest.fn() as any).mockResolvedValue({
    message: 'Instrucciones enviadas',
  }),
  resetPassword: (jest.fn() as any).mockResolvedValue({
    message: 'Contraseña restablecida',
  }),
});

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useFactory: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should call authService.login and return token', async () => {
      const dto = { email: 'test@test.com', password: 'password123' };
      const result = await controller.login(dto as any);

      expect(result).toEqual({ access_token: 'mock_token' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('forgotPassword', () => {
    it('should call authService.forgotPassword', async () => {
      const dto = { email: 'test@test.com' };
      const result = await controller.forgotPassword(dto as any);

      expect(result).toEqual({ message: 'Instrucciones enviadas' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('resetPassword', () => {
    it('should call authService.resetPassword', async () => {
      const dto = { token: 'some_token', newPassword: 'new_password123' };
      const result = await controller.resetPassword(dto as any);

      expect(result).toEqual({ message: 'Contraseña restablecida' });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });
});
