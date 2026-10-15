import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'usuario@correo.com',
    description: 'Correo electrónico registrado del usuario',
  })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail(
    {},
    { message: 'El correo electrónico debe ser una dirección válida' },
  )
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Contraseña de acceso del usuario (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
