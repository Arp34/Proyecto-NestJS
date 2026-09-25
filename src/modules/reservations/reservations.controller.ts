import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { ApiOperation, ApiTags } from '@nestjs/swagger';


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
  create(@Body() createReservationDto: CreateReservationDto) {
    return this.reservationsService.create(createReservationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener todas las reservas',
  })
  findAll() {
    return this.reservationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener todas las reservas por su ID',
  })
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Actualizar por ID',
    description: 'Se actualizara la reserva por medio del ID'
  })
  update(@Param('id') id: string, @Body() updateReservationDto: UpdateReservationDto) {
    return this.reservationsService.update(id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reservationsService.remove(id);
  }
}
