import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jest, expect } from '@jest/globals';

import { CustomersService } from './customers.service.js';
import { Customer } from './entities/customer.entity.js';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockCustomerRepository = {
    create: jest.fn<(customer: Partial<Customer>) => Customer>(),

    save: jest.fn<(customer: Customer) => Promise<Customer>>(),

    find: jest.fn<() => Promise<Customer[]>>(),

    findOne: jest.fn<
      (options: {
        where: {
          email?: string;
        };
      }) => Promise<Customer | null>
    >(),

    findOneBy: jest.fn<(options: { id: string }) => Promise<Customer | null>>(),

    preload:
      jest.fn<(customer: Partial<Customer>) => Promise<Customer | undefined>>(),

    remove: jest.fn<(customer: Customer) => Promise<Customer>>(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // CREATE

  it('should create a customer', async () => {
    const dto = {
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@gmail.com',
    };

    const customer: Customer = {
      id: 'uuid-1',
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomerRepository.findOne.mockResolvedValue(null);
    mockCustomerRepository.create.mockReturnValue(customer);
    mockCustomerRepository.save.mockResolvedValue(customer);

    const result = await service.create(dto);

    expect(mockCustomerRepository.findOne).toHaveBeenCalledWith({
      where: {
        email: dto.email,
      },
    });

    expect(mockCustomerRepository.create).toHaveBeenCalledWith(dto);

    expect(mockCustomerRepository.save).toHaveBeenCalledWith(customer);

    expect(result).toEqual(customer);
  });

  it('should throw ConflictException if email already exists', async () => {
    const dto = {
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@gmail.com',
    };

    const existingCustomer: Customer = {
      id: 'uuid-1',
      name: 'Pedro',
      phone: '3009876543',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomerRepository.findOne.mockResolvedValue(existingCustomer);

    await expect(service.create(dto)).rejects.toThrow(
      'El email ya esta registrado',
    );

    expect(mockCustomerRepository.create).not.toHaveBeenCalled();

    expect(mockCustomerRepository.save).not.toHaveBeenCalled();
  });

  // FIND ALL

  it('should return all customers', async () => {
    const customers: Customer[] = [
      {
        id: 'uuid-1',
        name: 'Juan',
        phone: '3001234567',
        email: 'juan@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'uuid-2',
        name: 'Pedro',
        phone: '3009876543',
        email: 'pedro@gmail.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCustomerRepository.find.mockResolvedValue(customers);

    const result = await service.findAll();

    expect(result).toEqual(customers);

    expect(mockCustomerRepository.find).toHaveBeenCalled();
  });

  // FIND ONE

  it('should return a customer by id', async () => {
    const customer: Customer = {
      id: 'uuid-1',
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomerRepository.findOneBy.mockResolvedValue(customer);

    const result = await service.findOne('uuid-1');

    expect(mockCustomerRepository.findOneBy).toHaveBeenCalledWith({
      id: 'uuid-1',
    });

    expect(result).toEqual(customer);
  });

  it('should throw NotFoundException if customer does not exist', async () => {
    mockCustomerRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('uuid-1')).rejects.toThrow(
      'Cliente no encontrado',
    );

    expect(mockCustomerRepository.findOneBy).toHaveBeenCalledWith({
      id: 'uuid-1',
    });
  });

  // UPDATE

  it('should update a customer using preload', async () => {
    const updateDto = {
      name: 'Juan actualizado',
      phone: '3009999999',
    };

    const updatedCustomer: Customer = {
      id: 'uuid-1',
      name: 'Juan actualizado',
      phone: '3009999999',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomerRepository.preload.mockResolvedValue(updatedCustomer);

    mockCustomerRepository.save.mockResolvedValue(updatedCustomer);

    const result = await service.update('uuid-1', updateDto);

    expect(mockCustomerRepository.preload).toHaveBeenCalledWith({
      id: 'uuid-1',
      ...updateDto,
    });

    expect(mockCustomerRepository.save).toHaveBeenCalledWith(updatedCustomer);

    expect(result).toEqual(updatedCustomer);
  });

  it('should throw ConflictException if update email already exists', async () => {
    const updateDto = {
      email: 'pedro@gmail.com',
    };

    const existingCustomer: Customer = {
      id: 'uuid-2',
      name: 'Pedro',
      phone: '3009876543',
      email: 'pedro@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomerRepository.findOne.mockResolvedValue(existingCustomer);

    await expect(service.update('uuid-1', updateDto)).rejects.toThrow(
      'El email ya esta registrado',
    );

    expect(mockCustomerRepository.preload).not.toHaveBeenCalled();

    expect(mockCustomerRepository.save).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException if update id does not exist', async () => {
    const updateDto = {
      name: 'Juan actualizado',
    };

    mockCustomerRepository.preload.mockResolvedValue(undefined);

    await expect(service.update('uuid-1', updateDto)).rejects.toThrow(
      'Cliente no encontrado',
    );

    expect(mockCustomerRepository.preload).toHaveBeenCalledWith({
      id: 'uuid-1',
      ...updateDto,
    });

    expect(mockCustomerRepository.save).not.toHaveBeenCalled();
  });

  // REMOVE

  it('should remove a customer', async () => {
    const customer: Customer = {
      id: 'uuid-1',
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@gmail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockCustomerRepository.findOneBy.mockResolvedValue(customer);

    mockCustomerRepository.remove.mockResolvedValue(customer);

    const result = await service.remove('uuid-1');

    expect(mockCustomerRepository.findOneBy).toHaveBeenCalledWith({
      id: 'uuid-1',
    });

    expect(mockCustomerRepository.remove).toHaveBeenCalledWith(customer);

    expect(result).toEqual({
      message: 'Cliente eliminado correctamente',
    });
  });

  it('should throw NotFoundException if remove id does not exist', async () => {
    mockCustomerRepository.findOneBy.mockResolvedValue(null);

    await expect(service.remove('uuid-1')).rejects.toThrow(
      'Cliente no encontrado',
    );

    expect(mockCustomerRepository.remove).not.toHaveBeenCalled();
  });
});
