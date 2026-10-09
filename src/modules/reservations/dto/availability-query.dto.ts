import { ApiProperty } from '@nestjs/swagger'; // para que Swagger muestre ejemplos
import { Type } from 'class-transformer'; // para convertir texto en número
import { IsInt, Matches, Min } from 'class-validator'; // los "guardias" de datos
import { IsNotPastDateTime } from '../validators/is-not-past-datetime.validator.js'; // nuestro guardia

// Este es el PORTERO: revisa lo que llega en la URL
// (?date=...&time=...&guests=...) antes de dejarlo pasar.
export class AvailabilityQueryDto {
  // El día. Debe verse como 2026-10-15.
  @ApiProperty({ example: '2026-10-15', description: 'Fecha (YYYY-MM-DD)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date debe tener el formato YYYY-MM-DD',
  })
  date: string;

  // La hora. Debe verse como 19:30 (reloj de 24 horas).
  @ApiProperty({ example: '19:30', description: 'Hora (HH:mm, 24 horas)' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'time debe tener el formato HH:mm (24 horas)',
  })
  @IsNotPastDateTime() // RN-039: ni fechas ni horas que ya pasaron
  time: string;

  // Cuántas personas van a comer.
  @ApiProperty({
    example: 4,
    minimum: 1,
    description: 'Cantidad de comensales',
  })
  @Type(() => Number) // en la URL todo llega como texto ("4"); lo volvemos número (4)
  @IsInt({ message: 'guests debe ser un número entero' }) // nada de 2.5 personas
  @Min(1, { message: 'guests debe ser mayor que cero' }) // RN-038: mínimo 1 persona
  guests: number;
}
