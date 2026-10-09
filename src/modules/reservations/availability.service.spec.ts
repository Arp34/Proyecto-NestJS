import { describe, it, expect, jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import { AvailabilityService } from './availability.service.js';
import { TableStatus } from '../tables/enums/table-status.enum.js';
import { ReservationStatus } from './entities/reservation.entity.js';

// Un "buscador de mentiritas": en las pruebas no usamos la base de datos real.
// Cada paso de la búsqueda devuelve el mismo buscador, para poder encadenarlos,
// y al final entrega el resultado que nosotros le decimos.
type Fn = (...args: unknown[]) => unknown;

const makeQb = (result: unknown[]) => {
  const qb = {} as Record<string, jest.Mock<Fn>>;
  ['innerJoin', 'select', 'where', 'andWhere', 'orderBy', 'addOrderBy'].forEach(
    (m) => (qb[m] = jest.fn<Fn>(() => qb)),
  );
  qb.getRawMany = jest.fn<Fn>(async () => result);
  qb.getMany = jest.fn<Fn>(async () => result);
  return qb;
};

describe('AvailabilityService', () => {
  // Una consulta de ejemplo que usan casi todas las pruebas.
  const query = { date: '2026-10-15', time: '19:30', guests: 4 };

  // Prepara el mesero con cuadernos de mentiritas:
  // `busy` = reservas que "existen"; `tables` = mesas que "existen".
  const setup = (busy: { id: string }[], tables: unknown[]) => {
    const reservationsQb = makeQb(busy);
    const tablesQb = makeQb(tables);
    const service = new AvailabilityService(
      { createQueryBuilder: jest.fn().mockReturnValue(tablesQb) } as never,
      {
        createQueryBuilder: jest.fn().mockReturnValue(reservationsQb),
      } as never,
    );
    return { service, reservationsQb, tablesQb };
  };

  // Prueba 1: ¿pide solo mesas AVAILABLE con capacidad suficiente?
  it('devuelve las mesas aptas (RN-040, RN-041)', async () => {
    const tables = [{ id: '1', capacity: 4 }];
    const { service, tablesQb } = setup([], tables);

    await expect(service.findAvailableTables(query)).resolves.toEqual(tables);
    expect(tablesQb.where).toHaveBeenCalledWith('t.status = :status', {
      status: TableStatus.AVAILABLE,
    });
    expect(tablesQb.andWhere).toHaveBeenCalledWith('t.capacity >= :guests', {
      guests: 4,
    });
    expect(tablesQb.orderBy).toHaveBeenCalledWith('t.capacity', 'ASC');
  });

  // Prueba 2: si las mesas 2 y 5 están ocupadas, ¿las tacha? (la 2 repetida cuenta una vez)
  it('excluye mesas con reserva solapada (RN-042)', async () => {
    const { service, tablesQb } = setup(
      [{ id: '2' }, { id: '2' }, { id: '5' }],
      [],
    );

    await service.findAvailableTables(query);

    expect(tablesQb.andWhere).toHaveBeenCalledWith(
      't.id NOT IN (:...busyTableIds)',
      {
        busyTableIds: ['2', '5'],
      },
    );
  });

  // Prueba 3: si no hay mesas ocupadas, no debe tachar nada.
  it('no agrega NOT IN cuando no hay conflictos', async () => {
    const { service, tablesQb } = setup([], []);

    await service.findAvailableTables(query);

    const clauses = tablesQb.andWhere.mock.calls.map((c) => c[0]);
    expect(clauses).not.toContain('t.id NOT IN (:...busyTableIds)');
  });

  // Prueba 4: ¿mira solo el día, los estados correctos y la franja 17:30 a 21:30?
  it('solo considera reservas PENDING/CONFIRMED en la ventana ±2h (RN-042)', async () => {
    const { service, reservationsQb } = setup([], []);

    await service.findAvailableTables(query);

    expect(reservationsQb.where).toHaveBeenCalledWith('r.date = :date', {
      date: '2026-10-15',
    });
    expect(reservationsQb.andWhere).toHaveBeenCalledWith(
      'r.status IN (:...statuses)',
      {
        statuses: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
      },
    );
    expect(reservationsQb.andWhere).toHaveBeenCalledWith('r.time > :from', {
      from: '17:30:00',
    });
    expect(reservationsQb.andWhere).toHaveBeenCalledWith('r.time < :to', {
      to: '21:30:00',
    });
  });

  // Prueba 5: cerca de la medianoche, la franja no se sale del día.
  it('acota la ventana a los límites del día', async () => {
    const { service, reservationsQb } = setup([], []);

    await service.findAvailableTables({ ...query, time: '23:00' });
    await service.findAvailableTables({ ...query, time: '00:30' });

    const calls = reservationsQb.andWhere.mock.calls;
    expect(calls).toContainEqual(['r.time < :to', { to: '24:00:00' }]);
    expect(calls).toContainEqual(['r.time > :from', { from: '00:00:00' }]);
  });

  // Prueba 6: con 0 personas debe salir error.
  it('rechaza guests < 1 (RN-038)', async () => {
    const { service } = setup([], []);

    await expect(
      service.findAvailableTables({ ...query, guests: 0 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
