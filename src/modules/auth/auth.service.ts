import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

import { CustomersService } from '../customers/customers.service.js';
import { CustomerStatus } from '../customers/entities/customer.entity.js';
import { ForgotPasswordDto } from '../customers/dto/forgot-password.dto.js';
import { LoginDto } from '../customers/dto/login.dto.js';
import { ResetPasswordDto } from '../customers/dto/reset-password.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const customer = await this.customersService.findByEmailForAuth(email);

    if (!customer) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (customer.status !== CustomerStatus.ACTIVE) {
      throw new UnauthorizedException('La cuenta no se encuentra activa');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { sub: customer.id, email: customer.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const customer = await this.customersService.findByEmailForAuth(email);

    if (!customer) {
      return {
        message: 'Si el correo está registrado, recibirás las instrucciones',
      };
    }

    const token = randomUUID();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await this.customersService.setResetPasswordToken(
      customer.id,
      token,
      expires,
    );

    console.log(`\n========================================`);
    console.log(`[SIMULACIÓN EMAIL] Reset Token: ${token}`);
    console.log(`Para: ${email}`);
    console.log(`========================================\n`);

    return {
      message: 'Si el correo está registrado, recibirás las instrucciones',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;
    const customer = await this.customersService.findByResetToken(token);

    if (!customer || !customer.resetPasswordExpires) {
      throw new BadRequestException('El token de recuperación es inválido');
    }

    if (new Date() > customer.resetPasswordExpires) {
      throw new BadRequestException('El token de recuperación ha expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.customersService.resetPasswordWithToken(
      customer.id,
      hashedPassword,
    );

    return {
      message: 'La contraseña ha sido restablecida exitosamente',
    };
  }
}
