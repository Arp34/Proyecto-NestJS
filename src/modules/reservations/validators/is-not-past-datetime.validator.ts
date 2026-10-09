// Herramientas de class-validator para crear nuestro PROPIO "guardia" de datos.
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

// "Molde" de una fecha: 4 números, guion, 2 números, guion, 2 números. Ej: 2026-10-15
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// "Molde" de una hora: de 00:00 a 23:59. Ej: 19:30
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * RN-039: no se puede pedir una mesa para ayer ni para una hora que ya pasó.
 * Es como una etiqueta (@IsNotPastDateTime) que pegamos sobre `time`.
 * Para saber si ya pasó, necesita mirar la fecha Y la hora juntas.
 */
export function IsNotPastDateTime(validationOptions?: ValidationOptions) {
  // Esta función se ejecuta cuando pegamos la etiqueta sobre un campo.
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isNotPastDateTime', // el nombre de nuestro guardia
      target: object.constructor, // en qué clase vive (el DTO)
      propertyName, // en qué campo está pegada (time)
      options: {
        // Mensaje que verá la persona si se equivoca:
        message: 'No se permite consultar fechas u horas pasadas',
        ...validationOptions,
      },
      validator: {
        // Aquí el guardia decide: true = "pasa", false = "no pasa".
        validate(value: unknown, args: ValidationArguments): boolean {
          // `value` es la hora. La fecha la sacamos del mismo DTO (args.object).
          const date = (args.object as { date?: unknown }).date;

          // Si la fecha o la hora están mal escritas, aquí no regañamos:
          // ya las regañan los @Matches. Así no salen dos mensajes iguales.
          if (
            typeof value !== 'string' ||
            typeof date !== 'string' ||
            !TIME_RE.test(value) ||
            !DATE_RE.test(date)
          ) {
            return true;
          }

          // Partimos "2026-10-15" en año, mes y día (números).
          const [y, m, d] = date.split('-').map(Number);
          // Partimos "19:30" en hora y minutos.
          const [hh, mm] = value.split(':').map(Number);
          // Armamos la fecha completa. (El mes en JavaScript empieza en 0, por eso m - 1)
          const when = new Date(y, m - 1, d, hh, mm, 0, 0);

          // ¿Existe de verdad ese día? El 31 de febrero NO existe: JavaScript
          // lo "corrige" a marzo, y así nos damos cuenta del truco.
          const isRealDate =
            when.getFullYear() === y &&
            when.getMonth() === m - 1 &&
            when.getDate() === d;
          if (!isRealDate) return false;

          // Pasa solo si la fecha pedida es AHORA o más adelante.
          return when.getTime() >= Date.now();
        },
      },
    });
  };
}
