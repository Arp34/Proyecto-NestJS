import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query, // NUEVO: sirve para leer lo que viene en la URL (?date=...&time=...)
} from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { AvailabilityService } from './availability.service.js'; // NUEVO
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { AvailabilityQueryDto } from './dto/availability-query.dto.js'; // NUEVO: el portero
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Reservations')
@Controller('reservations') // todas las rutas de aquí empiezan con /reservations
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    // NUEVO: le damos al controlador el mesero que busca mesas libres.
    private readonly availabilityService: AvailabilityService,
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

  // NUEVO: GET /reservations/availability?date=...&time=...&guests=...
  // IMPORTANTE: va ANTES de @Get(':id'). Si no, Nest creería que la palabra
  // "availability" es el id de una reserva y se confundiría.
  @Get('availability')
  @ApiOperation({
    summary: 'Consultar mesas disponibles',
    description:
      'Devuelve las mesas AVAILABLE con capacidad suficiente y sin reservas PENDING/CONFIRMED solapadas en la franja.',
  })
  findAvailability(@Query() query: AvailabilityQueryDto) {
    // El portero (AvailabilityQueryDto) revisa los datos, y si están bien,
    // se los pasamos al mesero para que busque las mesas.
    return this.availabilityService.findAvailableTables(query);
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
    description: 'Se actualizara la reserva por medio del ID',
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
