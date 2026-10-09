import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from '../tables/entities/table.entity.js';
import { TableStatus } from '../tables/enums/table-status.enum.js';
import { Reservation } from './entities/reservation.entity.js';
import { AvailabilityQueryDto } from './dto/availability-query.dto.js';
import {
  BLOCKING_RESERVATION_STATUSES,
  RESERVATION_DURATION_MINUTES,
} from './reservations.constants.js';

// Un día tiene 24 horas x 60 minutos = 1440 minutos.
const MINUTES_IN_DAY = 24 * 60;

// Este es el MESERO: el que realmente busca qué mesas están libres.
@Injectable()
export class AvailabilityService {
  constructor(
    // Cuaderno donde están anotadas todas las MESAS.
    @InjectRepository(Table)
    private readonly tablesRepository: Repository<Table>,
    // Cuaderno donde están anotadas todas las RESERVAS.
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  /**
   * La función principal. Le damos día, hora y cantidad de personas,
   * y nos devuelve la lista de mesas que sirven.
   * Una mesa sirve si:
   *  - RN-040: está AVAILABLE (no está ocupada ni fuera de servicio)
   *  - RN-041: tiene capacidad para todas las personas
   *  - RN-042: nadie la reservó para esa misma franja de tiempo
   * La lista sale ordenada de la mesa más pequeña a la más grande,
   * para no gastar una mesa de 10 en una pareja.
   */
  async findAvailableTables(query: AvailabilityQueryDto): Promise<Table[]> {
    const guests = Number(query.guests);
    // Por si alguien se salta al portero: si son 0 personas o no es un
    // número entero, avisamos con error 400. (RN-038)
    if (!Number.isInteger(guests) || guests < 1) {
      throw new BadRequestException('guests debe ser mayor que cero');
    }

    // Paso 1: ¿qué mesas están "ocupadas" por otra reserva en esa franja?
    const busyTableIds = await this.findBusyTableIds(query.date, query.time);

    // Paso 2: armamos la búsqueda de mesas, una condición por vez.
    const qb = this.tablesRepository
      .createQueryBuilder('t') // "t" = apodo corto para la tabla de mesas
      .where('t.status = :status', { status: TableStatus.AVAILABLE }) // solo AVAILABLE
      .andWhere('t.capacity >= :guests', { guests }); // que quepan todos

    // Paso 3: si hay mesas ocupadas, las tachamos de la lista.
    if (busyTableIds.length > 0) {
      qb.andWhere('t.id NOT IN (:...busyTableIds)', { busyTableIds });
    }

    // Paso 4: ordenamos (más chica primero) y traemos el resultado.
    return qb.orderBy('t.capacity', 'ASC').addOrderBy('t.id', 'ASC').getMany();
  }

  /**
   * Devuelve los ids de las mesas que YA tienen reserva en esa franja.
   *
   * Cada reserva dura D (2 horas). Dos reservas se pisan si empiezan a menos
   * de D de distancia. Si la nueva empieza a las 19:30 y D = 2 h, nos molesta
   * cualquier reserva que empiece después de las 17:30 y antes de las 21:30.
   */
  private async findBusyTableIds(
    date: string,
    time: string,
  ): Promise<string[]> {
    // Calculamos el "desde" y el "hasta" de la franja que nos molesta.
    const { from, to } = this.buildWindow(time);

    const rows = await this.reservationsRepository
      .createQueryBuilder('r') // "r" = apodo corto para reservas
      .innerJoin('r.table', 'rt') // pegamos cada reserva con su mesa
      .select('rt.id', 'id') // solo queremos el id de la mesa
      .where('r.date = :date', { date }) // el mismo día
      .andWhere('r.status IN (:...statuses)', {
        statuses: BLOCKING_RESERVATION_STATUSES, // solo PENDING o CONFIRMED
      })
      .andWhere('r.time > :from', { from }) // empieza después del "desde"
      .andWhere('r.time < :to', { to }) // y antes del "hasta"
      .getRawMany<{ id: string }>();

    // `new Set` quita los ids repetidos (si una mesa tiene 2 reservas, sale 1 vez).
    return [...new Set(rows.map((row) => row.id))];
  }

  // Calcula la franja que molesta: 2 horas antes y 2 horas después.
  private buildWindow(time: string): { from: string; to: string } {
    const [hh, mm] = time.split(':').map(Number); // "19:30" -> 19 y 30
    const start = hh * 60 + mm; // pasamos todo a minutos: 19:30 = 1170
    // No dejamos que baje de las 00:00...
    const from = Math.max(start - RESERVATION_DURATION_MINUTES, 0);
    // ...ni que pase de la medianoche (24:00).
    const to = Math.min(start + RESERVATION_DURATION_MINUTES, MINUTES_IN_DAY);
    return { from: this.toSqlTime(from), to: this.toSqlTime(to) };
  }

  // Convierte minutos de vuelta a texto de hora: 1050 -> "17:30:00"
  private toSqlTime(totalMinutes: number): string {
    const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0'); // horas, con 0 adelante
    const m = String(totalMinutes % 60).padStart(2, '0'); // minutos, con 0 adelante
    return `${h}:${m}:00`; // "24:00:00" es válido en PostgreSQL
  }
}
