import { Test, TestingModule } from '@nestjs/testing';
import { jest, expect } from '@jest/globals';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';
import { Customer } from './entities/customer.entity.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';

describe('CustomersController', () => {
  let controller: CustomersController;

const mockCustomersService = {
  create: jest.fn<
    (dto: Partial<CreateCustomerDto>) => Promise<Customer>
  >(),

  findAll: jest.fn<
    () => Promise<Customer[]>
  >(),

  findOne: jest.fn<
    (id: string) => Promise<Customer | null>
  >(),

  update: jest.fn<
    (
      id: string,
      dto: Partial<UpdateCustomerDto>,
    ) => Promise<Customer | null>>(),

  remove: jest.fn<
    (id: string) => Promise<{ message: string }>>(),
};
  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [CustomersController],
        providers: [
          {
            provide: CustomersService,
            useValue: mockCustomersService,
          },
        ],
      }).compile();

    controller = module.get<CustomersController>(
      CustomersController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a customer', async () => {
    const dto = {
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customer = {
      id: 'uuid-1',
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomersService.create.mockResolvedValue(customer);

    const result = await controller.create(dto);

    expect(mockCustomersService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(customer);
  });

  it('should return all customers', async () => {
    const customers: Customer[] = [
      {
        id: 'uuid-1',
        name: 'Juan',
        phone: '3001234567',
        email: 'juan@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'uuid-2',
        name: 'Pedro',
        phone: '3009876543',
        email: 'pedro@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ];

    mockCustomersService.findAll.mockResolvedValue(customers);

    const result = await controller.findAll();

    expect(mockCustomersService.findAll).toHaveBeenCalled();
    expect(result).toEqual(customers);
  });

  it('should return a customer by id', async () => {
    const customer: Customer = {
      id: 'uuid-1',
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomersService.findOne.mockResolvedValue(customer);

    const result = await controller.findOne('uuid-1');

    expect(mockCustomersService.findOne).toHaveBeenCalledWith(
      'uuid-1',
    );

    expect(result).toEqual(customer);
  });

  it('should update a customer', async () => {
    const updateDto = {
      name: 'Juan actualizado',
      phone: '3009999999',
    };

    const customer: Customer = {
      id: 'uuid-1',
      name: 'Juan actualizado',
      phone: '3009999999',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomersService.update.mockResolvedValue(customer);

    const result = await controller.update(
      'uuid-1',
      updateDto,
    );

    expect(mockCustomersService.update).toHaveBeenCalledWith(
      'uuid-1',
      updateDto,
    );

    expect(result).toEqual(customer);
  });

  it('should remove a customer', async () => {
    const response = {
      message: 'Cliente eliminado correctamente',
    };

    mockCustomersService.remove.mockResolvedValue(response);

    const result = await controller.remove('uuid-1');

    expect(mockCustomersService.remove).toHaveBeenCalledWith(
      'uuid-1',
    );

    expect(result).toEqual(response);
  });
});