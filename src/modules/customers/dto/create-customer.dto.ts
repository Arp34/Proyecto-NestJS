import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del cliente',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name: string;

  @ApiProperty({
    example: '3001234567',
    description: 'Número de teléfono del cliente',
  })
  @Transform(({ value }) => value?.trim())
  @IsString({ message: 'El teléfono debe estar en un formato válido' })
  @IsNotEmpty({ message: 'El teléfono no puede estar vacío' })
  phone: string;

  @ApiProperty({
    example: 'juan@gmail.com',
    description: 'Correo electrónico del cliente',
  })
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString({ message: 'El email debe ser texto' })
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @IsNotEmpty({ message: 'El email no puede estar vacío' })
  email: string;

  @ApiProperty({
    example: 'Secret123!',
    description: 'Contraseña de la cuenta del cliente (mínimo 6 caracteres)',
  })
  @IsString({ message: 'La contraseña debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña no puede estar vacía' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
