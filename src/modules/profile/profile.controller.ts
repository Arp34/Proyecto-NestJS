import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CustomersService } from '../customers/customers.service.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { UpdateProfileDto } from '../profile/dto/update-profile.dto.js';

@ApiTags('Profile')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil del usuario recuperado exitosamente',
    schema: {
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Juan',
        lastName: 'Pérez',
        email: 'usuario@correo.com',
        phone: '+573001234567',
        status: 'ACTIVE',
      },
    },
  })
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.customersService.findOne(user.userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar perfil del usuario autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Perfil actualizado exitosamente',
  })
  updateProfile(
    @CurrentUser() user: { userId: string },
    @Body() updateData: UpdateProfileDto,
  ) {
    return this.customersService.updateProfile(user.userId, updateData);
  }
}
