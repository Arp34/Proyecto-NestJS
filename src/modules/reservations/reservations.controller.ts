import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ReservationsService } from './reservations.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';

@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reserva' })
  @ApiResponse({ status: 201, description: 'Reserva creada con estado PENDING' })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos, fecha pasada o capacidad excedida',
  })
  @ApiResponse({ status: 404, description: 'Mesa o cliente no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'La mesa ya está reservada en ese horario',
  })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reservas' })
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva por su ID' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
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

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar una reserva por ID',
    description: 'Actualiza la reserva y vuelve a validar capacidad y disponibilidad',
  })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  @ApiResponse({ status: 409, description: 'La mesa ya está reservada en ese horario' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una reserva por ID' })
  @ApiResponse({ status: 204, description: 'Reserva eliminada' })
  @ApiResponse({ status: 404, description: 'Reserva no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservationsService.remove(id);
  }
}