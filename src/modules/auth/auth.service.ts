import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { instanceToPlain } from 'class-transformer';

import { CustomersService } from '../customers/customers.service.js';
import { CustomerStatus } from '../customers/entities/customer.entity.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    let customer;
    try {
      customer = await this.customersService.findByEmail(email);
    } catch {
      customer = null;
    }

    // Evita pasar undefined a bcrypt y previene enumeración de usuarios
    if (!customer || !customer.password) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new UnauthorizedException('La cuenta no se encuentra activa');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: customer.id,
      email: customer.email,
      role: customer.role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      customer: instanceToPlain(customer),
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    let customer;
    try {
      customer = await this.customersService.findByEmail(email);
    } catch {
      customer = null;
    }

    if (!customer) {
      return {
        message: 'Si el correo está registrado, recibirás las instrucciones',
      };
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.customersService.setResetPasswordToken(
      customer.email,
      token,
      expires,
    );

    return {
      message: 'Si el correo está registrado, recibirás las instrucciones',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    return await this.customersService.resetPasswordWithToken(
      token,
      newPassword,
    );
  }
}
