import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateReservationDto } from './dto/create-reservation.dto.js';
import { UpdateReservationDto } from './dto/update-reservation.dto.js';
import {
  Reservation,
  ReservationStatus,
} from './entities/reservation.entity.js';
import { Table } from '../tables/entities/table.entity.js';
// Ajusta el nombre de la clase y la ruta si tu entity de clientes es distinta
import { Customer } from '../customers/entities/customer.entity.js';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const { customer_id, table_id, date, time, guests, notes } =
      createReservationDto;

    this.ensureNotInPast(date, time);
    await this.ensureCustomerExists(customer_id);

    // table_id es opcional: solo se valida si viene en la petición
    if (table_id) {
      await this.ensureTableFits(table_id, guests);
      await this.ensureNoConflict(table_id, date, time);
    }

    const reservation = this.reservationsRepository.create({
      customer_id,
      table_id,
      date,
      time,
      guests,
      notes,
      status: ReservationStatus.PENDING,
    });

    return this.reservationsRepository.save(reservation);
  }

  findAll() {
    return this.reservationsRepository.find();
  }

  async findOne(id: string) {
    const reservation = await this.reservationsRepository.findOne({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con id ${id} no encontrada`);
    }

    return reservation;
  }

  async update(id: string, updateReservationDto: UpdateReservationDto) {
    const reservation = await this.findOne(id);

    // Valores finales = lo que ya tenía + lo que cambia
    const customer_id =
      updateReservationDto.customer_id ?? reservation.customer_id;
    const table_id = updateReservationDto.table_id ?? reservation.table_id;
    const date = updateReservationDto.date ?? reservation.date;
    const time = updateReservationDto.time ?? reservation.time;
    const guests = updateReservationDto.guests ?? reservation.guests;

    if (updateReservationDto.date || updateReservationDto.time) {
      this.ensureNotInPast(date, time);
    }

    if (updateReservationDto.customer_id) {
      await this.ensureCustomerExists(customer_id);
    }

    if (table_id) {
      if (updateReservationDto.table_id || updateReservationDto.guests) {
        await this.ensureTableFits(table_id, guests);
      }
      // Se excluye la propia reserva para que no choque consigo misma
      await this.ensureNoConflict(table_id, date, time, id);
    }

    Object.assign(reservation, updateReservationDto);
    return this.reservationsRepository.save(reservation);
  }

  async remove(id: string): Promise<void> {
    const result = await this.reservationsRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`Reserva con id ${id} no encontrada`);
    }
  }

  // ---------- Validaciones internas ----------

  private async ensureCustomerExists(customer_id: string) {
    const customer = await this.customersRepository.findOne({
      where: { id: customer_id },
    });

    if (!customer) {
      throw new NotFoundException(
        `Cliente con id ${customer_id} no encontrado`,
      );
    }
  }

  private async ensureTableFits(table_id: string, guests: number) {
    const table = await this.tablesRepository.findOne({
      where: { id: table_id },
    });

    if (!table) {
      throw new NotFoundException(`Mesa con id ${table_id} no encontrada`);
    }

    if (guests > table.capacity) {
      throw new ConflictException(
        `La mesa tiene capacidad para ${table.capacity} personas y la reserva es para ${guests}`,
      );
    }
  }

  private async ensureNoConflict(
    table_id: string,
    date: string,
    time: string,
    excludeId?: string,
  ) {
    const existing = await this.reservationsRepository.findOne({
      where: {
        table_id,
        date,
        time,
        // Una reserva cancelada libera la mesa
        status: Not(ReservationStatus.CANCELLED),
        ...(excludeId ? { id: Not(excludeId) } : {}),
      },
    });

    if (existing) {
      throw new ConflictException(
        'Ya existe una reserva para esa mesa, fecha y hora',
      );
    }
  }

  private ensureNotInPast(date: string, time: string) {
    const when = new Date(`${date.slice(0, 10)}T${time}`);

    // Si el formato no se puede interpretar, se deja pasar
    if (!Number.isNaN(when.getTime()) && when.getTime() < Date.now()) {
      throw new BadRequestException(
        'No se puede reservar en una fecha u hora pasada',
      );
    }
  }
}
