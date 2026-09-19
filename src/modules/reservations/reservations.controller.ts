import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  HttpCode} from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { ApiOperation, ApiTags, ApiResponse, ApiParam } from '@nestjs/swagger';


@ApiTags('Reservations')
@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Crear una nueva reserva',
  })
  @ApiResponse({
    status:201,
    description: 'Reserva creada correctamente',
  })
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las reservas',
  })
  @ApiResponse({
    status:200,
    description: 'Lista de reservas',
  })
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener todas las reservas por su ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la reserva',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva no encontrada'
  })
  @ApiResponse({
    status: 404,
    description: 'Reserva no encontrada'
  })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la reserva',
  })
  @ApiResponse({
    status: 200,
    description: 'Reserva actualizada correctamente',
  })

  update(
    @Param('id') id: string, 
    @Body() updateReservationDto: UpdateReservationDto
  ) {
    return this.reservationsService.update(
      id, 
      updateReservationDto
    );
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Eliminar una reserva por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID de la reserva'
  })
  @ApiResponse({
    status: 204,
    description: 'Reserva eliminada correctamente'
  })
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
