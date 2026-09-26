import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jest, expect } from '@jest/globals';
import { CustomersService } from './customers.service.js';
import { Customer } from './entities/customer.entity.js';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockCustomerRepository = {
  create: jest.fn() as jest.Mock,
  save: jest.fn() as jest.Mock,
  find: jest.fn<() => Promise<Customer[]>>(),
  findOneBy: jest.fn() as jest.Mock,
  update: jest.fn() as jest.Mock,
  delete: jest.fn() as jest.Mock,
};

  beforeEach(async () => {
    const module: TestingModule =
      await Test.createTestingModule({
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

  it('should return all customers', async () => {
    const customers = [
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
});