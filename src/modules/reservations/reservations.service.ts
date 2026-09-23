import { ConflictException, Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reservation } from './entities/reservation.entity.js';
@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    // Verificar si ya existe una reserva
    // para la misma mesa, fecha y hora
    const existingReservation = await this.reservationsRepository.findOne({
      where: {
        table_id: createReservationDto.table_id,
        date: createReservationDto.date,
        time: createReservationDto.time,
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        'Ya existe una reserva para esa mesa, fecha y hora',
      );
    }

    const reservation = this.reservationsRepository.create({
      customer_id: createReservationDto.customer_id,
      table_id: createReservationDto.table_id,
      date: createReservationDto.date,
      time: createReservationDto.time,
      guests: createReservationDto.guests,
      notes: createReservationDto.notes,
    });

    return this.reservationsRepository.save(reservation);
  }

  findAll() {
    return this.reservationsRepository.find();
  }

  findOne(id: string) {
    return this.reservationsRepository.findOne({
      where: { id },
    });
  }

  update(id: string, updateReservationDto: UpdateReservationDto) {
    return this.reservationsRepository.update(
      id,
      updateReservationDto,
    );
  }

  remove(id: string) {
    return this.reservationsRepository.delete( id );
  }
}