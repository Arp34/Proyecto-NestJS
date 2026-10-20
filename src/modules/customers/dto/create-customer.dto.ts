import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del cliente',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacio' })
  name: string;

  @ApiProperty({
    example: '3001234567',
    description: 'Número de teléfono del cliente',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El telefono debe estar en un formato valido' })
  @IsNotEmpty({ message: 'El telefono no puede estar vacio' })
  phone: string;

  @ApiProperty({
    example: 'juan@gmail.com',
    description: 'Correo electrónico del cliente',
    required: false,
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El email debe ser texto' })
  @IsEmail()
  @IsNotEmpty({ message: 'El email no puede estar vacio' })
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Contraseña del cliente',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacia' })
  password: string;

  @ApiProperty({
    example: 'admin',
    description: 'Rol del cliente (opcional, por defecto es "customer")',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El rol debe ser texto' })
  role?: string;
}
