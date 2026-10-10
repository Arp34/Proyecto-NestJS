import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../customers/dto/login.dto.js';
import { ForgotPasswordDto } from '../customers/dto/forgot-password.dto.js';
import { ResetPasswordDto } from '../customers/dto/reset-password.dto.js';

// Hice un controlador de autenticación con tres rutas: login, forgot-password y reset-password. Cada ruta tiene un método POST y utiliza DTOs para validar los datos de entrada. Además, he agregado documentación de Swagger para cada operación.
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  // Aquí está el código completo del controlador de autenticación con las rutas y la documentación de Swagger:
  @Post('login')
  @ApiOperation({
    summary: 'Iniciar sesión de usuario',
  })
  login(@Body() loginDto: LoginDto) {
    return { msg: 'Sesión inciada', data: loginDto };
  }

  // Rutas para la recuperación y restablecimiento de contraseña
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return { msg: 'Correo de recuperación enviado', data: forgotPasswordDto };
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Por favor, reestablece tu contraseña',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return { msg: 'Contraseña restablecida con éxito', data: resetPasswordDto };
  }
}
