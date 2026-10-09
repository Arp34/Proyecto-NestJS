import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AvailabilityQueryDto } from './availability-query.dto.js';

// Ayudante: le damos datos, el portero los revisa y nos dice
// en qué campos se equivocó. Lista vacía = todo bien.
const check = async (plain: Record<string, unknown>) => {
  const errors = await validate(plainToInstance(AvailabilityQueryDto, plain));
  return errors.map((e) => e.property);
};

describe('AvailabilityQueryDto', () => {
  // Congelamos el reloj: en estas pruebas "hoy" siempre es 9 oct 2026, 12:00.
  // Así los resultados no cambian con el día en que se corran.
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 9, 12, 0, 0));
  });
    afterEach(() => {
      jest.useRealTimers();
  }); // devolvemos el reloj normal

  it('acepta una consulta futura válida (guests llega como string)', async () => {
    expect(
      await check({ date: '2026-10-15', time: '19:30', guests: '4' }),
    ).toEqual([]);
  });

  it('acepta hoy a una hora futura', async () => {
    expect(
      await check({ date: '2026-10-09', time: '20:00', guests: '2' }),
    ).toEqual([]);
  });

  // Ayer ya pasó: error en `time`.
  it('rechaza fecha pasada (RN-039)', async () => {
    expect(
      await check({ date: '2026-10-08', time: '20:00', guests: '2' }),
    ).toEqual(['time']);
  });

  // Hoy, pero a las 9:00 (ya son las 12:00): error en `time`.
  it('rechaza hoy con hora pasada (RN-039)', async () => {
    expect(
      await check({ date: '2026-10-09', time: '09:00', guests: '2' }),
    ).toEqual(['time']);
  });

  // 0 personas y -3 personas no tienen sentido.
  it.each(['0', '-3'])('rechaza guests=%s (RN-038)', async (guests) => {
    expect(await check({ date: '2026-10-15', time: '19:30', guests })).toEqual([
      'guests',
    ]);
  });

  // "abc" no es número y 2.5 personas tampoco.
  it('rechaza guests no numérico o decimal', async () => {
    expect(
      await check({ date: '2026-10-15', time: '19:30', guests: 'abc' }),
    ).toEqual(['guests']);
    expect(
      await check({ date: '2026-10-15', time: '19:30', guests: '2.5' }),
    ).toEqual(['guests']);
  });

  // Fecha escrita al revés y hora 25:00 (no existe).
  it('rechaza formatos inválidos de date y time', async () => {
    expect(
      await check({ date: '15/10/2026', time: '25:00', guests: '2' }),
    ).toEqual(expect.arrayContaining(['date', 'time']));
  });

  // El 31 de febrero no existe.
  it('rechaza fechas inexistentes', async () => {
    expect(
      await check({ date: '2026-02-31', time: '19:30', guests: '2' }),
    ).toEqual(['time']);
  });

  // Si no mandan nada, se quejan los tres campos.
  it('rechaza parámetros faltantes', async () => {
    expect(await check({})).toEqual(
      expect.arrayContaining(['date', 'time', 'guests']),
    );
  });
});
