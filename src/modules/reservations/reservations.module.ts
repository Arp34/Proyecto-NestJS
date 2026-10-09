import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { AvailabilityService } from './availability.service.js'; // el mesero nuevo
import { ReservationsController } from './reservations.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { Table } from '../tables/entities/table.entity.js';
import { Customer } from '../customers/entities/customer.entity.js';

// El módulo es como el "organigrama" del restaurante: dice quién trabaja aquí.
@Module({
  // Los cuadernos (tablas de la base de datos) que este módulo puede usar.
  imports: [TypeOrmModule.forFeature([Reservation, Table, Customer])],
  // La puerta de entrada (recibe las peticiones).
  controllers: [ReservationsController],
  // Los trabajadores. AÑADIMOS AvailabilityService; si no, Nest no lo conoce.
  providers: [ReservationsService, AvailabilityService],
})
export class ReservationsModule {}
