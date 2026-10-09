import { ReservationStatus } from './entities/reservation.entity.js';

// Cuánto dura una reserva, en minutos (120 min = 2 horas).
// Así sabemos si dos reservas se "pisan": si una empieza menos de 2 horas
// después de otra, la mesa todavía está ocupada.
// Si el negocio dice que son 90 minutos, solo cambiamos este número.
export const RESERVATION_DURATION_MINUTES = 120;

// RN-042: estas son las reservas que "reservan" la mesa de verdad.
// Una reserva CANCELADA, por ejemplo, ya no estorba.
export const BLOCKING_RESERVATION_STATUSES: ReservationStatus[] = [
  ReservationStatus.PENDING, // pendiente de confirmar
  ReservationStatus.CONFIRMED, // confirmada
];
