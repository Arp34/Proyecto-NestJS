import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';
export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@correo.com',
    description:
      'Correo electrónico asociado a la cuenta para recuperar la contraseña',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
