import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { jest, expect } from '@jest/globals';
import { CustomersService } from './customers.service.js';
import { Customer } from './entities/customer.entity.js';

describe('CustomersService', () => {
  let service: CustomersService;

  const mockCustomerRepository = {
  create: jest.fn<(customer: Partial<Customer>) => Customer>(),
  save: jest.fn<(customer:Customer) => Promise<Customer>>(),
  find: jest.fn<() => Promise<Customer[]>>(),
  findOne: jest.fn<(options:{where: {email? : string }})=> Promise<Customer | null >>(),
  findOneBy: jest.fn<(options: {id:string}) =>  Promise<Customer | null>>(),
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

  it('should return a customer by id', async ()=> {

    const customer: Customer = {
      
      id: 'uuid-1',
      name: 'Juan',
      phone: '3001234567',
      email: 'juan@mail.com',
      createdAt: new Date(),
      updatedAt: new Date(),
  };

    mockCustomerRepository.findOneBy.mockResolvedValue(customer as Customer);

    const result = await service.findOne('uuid-1');

    expect(result).toEqual(customer)

    expect(
      mockCustomerRepository.findOneBy,
    ).toHaveBeenCalledWith({
      id: 'uuid-1'
    })

  })
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

  mockCustomerRepository.create.mockReturnValue(customer);

  mockCustomerRepository.save.mockResolvedValue(customer);

  const result = await service.create(dto);

  expect(
    mockCustomerRepository.create,
  ).toHaveBeenCalledWith(dto);

  expect(
    mockCustomerRepository.save,
  ).toHaveBeenCalledWith(customer);

  expect(result).toEqual(customer);
});
});



