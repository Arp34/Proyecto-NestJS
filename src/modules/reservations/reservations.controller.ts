import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam, // 👈 Se agregó ApiParam
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { ReservationResponseDto } from './dto/reservation-response.dto.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener reserva por ID' })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancelar reserva por ID',
    description:
      'Cambia el estado de la reserva a CANCELLED y libera la mesa asociada para ese bloque horario. Solo aplica si está en estado PENDING o CONFIRMED.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'ID (UUID) de la reserva a cancelar',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva cancelada exitosamente.',
    type: ReservationResponseDto, // 👈 Muestra la estructura de la reserva devuelta
  })
  @ApiResponse({
    status: 400,
    description:
      'Transición de estado inválida (Reserva COMPLETED o CANCELLED).',
    schema: {
      example: {
        statusCode: 400,
        message:
          'La reserva ya ha sido completada o cancelada, no se puede cancelar nuevamente',
        error: 'Bad Request',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva no encontrada.',
    schema: {
      example: {
        statusCode: 404,
        message:
          'Reserva con id a1b2c3d4-e5f6-7890-abcd-1234567890ab no encontrada',
        error: 'Not Found',
      },
    },
  })
  async cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }

  @Patch(':id/confirm')
  //*
  // comente esto porque me adelante a los temas del Auth y RolesGuard 
  // por el momento se puede modificar cuando quieran 
  // cuando Kevin termine el auth lo vuelvo a habilitar
  // */


  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('ADMIN', 'WAITER')
  @ApiOperation({ summary: 'Confirmar una reserva pendiente' })
  @ApiResponse({ status: 200, description: 'Reserva confirmada' })
  @ApiResponse({ status: 409, description: 'Estado de reserva no válido' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  confirm(@Param('id') id: string) {
    return this.reservationsService.confirm(id);
  }

  @Patch(':id/check-in')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('ADMIN', 'WAITER')
  @ApiOperation({ summary: 'Registrar la llegada del cliente' })
  @ApiResponse({ status: 200, description: 'Llegada registrada' })
  @ApiResponse({ status: 409, description: 'Estado de reserva no válido' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  checkIn(@Param('id') id: string) {
    return this.reservationsService.checkIn(id);
  }

  @Patch(':id/no-show')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@Roles('ADMIN', 'WAITER')
  @ApiOperation({ summary: 'Marcar una reserva como no presentada' })
  @ApiResponse({
    status: 200,
    description: 'Reserva marcada como no presentada',
  })
  @ApiResponse({ status: 409, description: 'Estado de reserva no válido' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  markNoShow(@Param('id') id: string) {
    return this.reservationsService.markNoShow(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar por ID',
    description: 'Se actualizará la reserva por medio del ID',
  })
  update(
    @Param('id') id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
