import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller.js';
import { CustomersService } from '../customers/customers.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

describe('ProfileController', () => {
  let controller: ProfileController;

  const mockCustomersService = {
    findOne: jest.fn((userId: string) => {
      return Promise.resolve({
        id: userId,
        name: 'Juan',
        email: 'usuario@correo.com',
      });
    }),
    updateProfile: jest.fn((userId: string, dto: UpdateProfileDto) => {
      return Promise.resolve({
        id: userId,
        name: dto.name,
        phone: dto.phone,
        password: dto.password,
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: CustomersService,
          useValue: mockCustomersService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('debería retornar el perfil del usuario autenticado', async () => {
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const result = await controller.getProfile(mockUser);

      expect(mockCustomersService.findOne).toHaveBeenCalledWith(
        mockUser.userId,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.userId,
          name: 'Juan',
        }),
      );
    });
  });

  describe('updateProfile', () => {
    it('debería actualizar el perfil del usuario autenticado', async () => {
      const mockUser = { userId: '123e4567-e89b-12d3-a456-426614174000' };
      const updateDto: UpdateProfileDto = {
        name: 'Carlos',
        phone: '3119876543',
      };

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(mockCustomersService.updateProfile).toHaveBeenCalledWith(
        mockUser.userId,
        updateDto,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.userId,
          name: 'Carlos',
          phone: '3119876543',
        }),
      );
    });
  });
});
