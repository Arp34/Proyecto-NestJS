import { Injectable } from '@nestjs/common';
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
  ){}
  create(createReservationDto: CreateReservationDto) {
    const reservation = this.reservationsRepository.create(
      createReservationDto,
    )
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
    return this.reservationsRepository.delete(id);
  }
}
