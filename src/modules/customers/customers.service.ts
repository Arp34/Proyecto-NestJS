import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { Customer } from './entities/customer.entity.js';
import { instanceToPlain } from 'class-transformer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    const existingCustomer = await this.customerRepository.findOne({
      where: {
        email: createCustomerDto.email,
      },
    });

    if (existingCustomer) {
      throw new ConflictException('El email ya esta registrado');
    }

    let hashedPassword = '';
    if (createCustomerDto.password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(createCustomerDto.password, salt);
    }

    const customer = this.customerRepository.create({
      name: createCustomerDto.name,
      email: createCustomerDto.email,
      phone: createCustomerDto.phone,
      password: hashedPassword,
      role: createCustomerDto.role || 'customer',
    });

    return this.customerRepository.save(customer);
  }

  findAll() {
    return this.customerRepository.find();
  }

  async findOne(id: string) {
    const customer = await this.customerRepository.findOneBy({ id });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    if (updateCustomerDto.email) {
      const existingCustomer = await this.customerRepository.findOne({
        where: {
          email: updateCustomerDto.email,
        },
      });

      if (existingCustomer && existingCustomer.id !== id) {
        throw new ConflictException('El email ya esta registrado');
      }
    }

    const customer = await this.customerRepository.preload({
      id,
      ...instanceToPlain(updateCustomerDto),
    });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.customerRepository.save(customer);
  }

  async remove(id: string) {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);

    return {
      message: 'Cliente eliminado correctamente',
    };
  }

  // --- MÉTODOS DE AUTENTICACIÓN Y PERFIL ---

  async findByEmail(email: string) {
    return await this.customerRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        status: true,
        role: true,
        name: true,
      },
    });
  }

  async findByEmailForAuth(email: string) {
    return this.findByEmail(email);
  }

  async setResetPasswordToken(email: string, token: string, expires: Date) {
    const customer = await this.customerRepository.findOne({
      where: { email },
    });

    // Si no existe, simplemente retornamos sin lanzar excepciones
    // para evitar revelar correos y generar errores 404 indeseados.
    if (!customer) {
      return;
    }

    customer.resetPasswordToken = token;
    customer.resetPasswordExpires = expires;
    await this.customerRepository.save(customer);

    console.log(`\n========================================`);
    console.log(`[SIMULACIÓN DE CORREO] Para: ${customer.email}`);
    console.log(`Tu token de recuperación es: ${token}`);
    console.log(`========================================\n`);
  }

  async findByResetToken(token: string) {
    const customer = await this.customerRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (
      !customer ||
      !customer.resetPasswordExpires ||
      customer.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Token inválido o expirado');
    }

    return customer;
  }

  async resetPasswordWithToken(token: string, newPassword: string) {
    const customer = await this.findByResetToken(token);

    const salt = await bcrypt.genSalt(10);
    customer.password = await bcrypt.hash(newPassword, salt);

    customer.resetPasswordToken = null;
    customer.resetPasswordExpires = null;

    await this.customerRepository.save(customer);
    return { message: 'Contraseña actualizada con éxito' };
  }

  async updateProfile(userId: string, updateData: any) {
    const customer = await this.findOne(userId);

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    Object.assign(customer, updateData);
    return await this.customerRepository.save(customer);
  }
}
