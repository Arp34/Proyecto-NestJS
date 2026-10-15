import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { ChangePasswordDto } from '../auth/dto/change-password.dto.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { Customer } from './entities/customer.entity.js';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const existingCustomer = await this.customerRepository.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomer) {
      throw new ConflictException('El email ya está registrado');
    }
    const customer = this.customerRepository.create(createCustomerDto);

    return this.customerRepository.save(customer);
  }

  findAll() {
    return this.customerRepository.find();
  }

  findOne(id: string) {
    return this.customerRepository.findOneBy({ id });
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    if (updateCustomerDto.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: updateCustomerDto.email },
      });

      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('El email ya esta registrado');
      }
    }

    await this.customerRepository.update(id, updateCustomerDto);

    return this.customerRepository.findOneBy({ id });
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const customer = await this.customerRepository.findOne({
      where: { id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    const isMatch = await bcrypt.compare(currentPassword, customer.password);
    if (!isMatch) {
      throw new UnauthorizedException('La contraseña actual es incorrecta');
    }

    await this.customerRepository.delete(id);

    return {
      message: 'Cliente eliminado correctamente',
    };
  }

  // --- Métodos auxiliares para Auth y Profile ---

  async findByEmailForAuth(email: string): Promise<Customer | null> {
    return this.customerRepository
      .createQueryBuilder('customer')
      .addSelect('customer.password')
      .where('customer.email = :email', { email })
      .getOne();
  }

  async setResetPasswordToken(id: string, token: string, expires: Date) {
    await this.customerRepository.update(id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async findByResetToken(token: string) {
    return this.customerRepository.findOne({
      where: { resetPasswordToken: token },
      select: {
        id: true,
        resetPasswordToken: true,
        resetPasswordExpires: true,
      },
    });
  }

  async resetPasswordWithToken(id: string, hashedPassword: string) {
    await this.customerRepository.update(id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async updateProfile(id: string, updateData: Partial<Customer>) {
    await this.customerRepository.update(id, updateData);
    return this.findOne(id);
  }
}
