import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service.js';
import { ReservationsController } from './reservations.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity.js';
import { Table } from '../tables/entities/table.entity.js';
import { Customer } from '../customers/entities/customer.entity.js';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Table, Customer])],
  controllers: [ReservationsController],
  providers: [ReservationsService, JwtAuthGuard, RolesGuard],
})
export class ReservationsModule {}
