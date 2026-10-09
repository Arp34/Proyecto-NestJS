import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReservationStatus } from '../entities/reservation.entity.js';

export class ReservationResponseDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ab',
    description: 'ID de la reserva (UUID)',
  })
  id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del cliente',
  })
  customer_id: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID de la mesa',
  })
  table_id?: string;

  @ApiProperty({ example: '2026-09-30', description: 'Fecha' })
  date: string;

  @ApiProperty({ example: '19:30', description: 'Hora' })
  time: string;

  @ApiProperty({ example: 4, description: 'Comensales' })
  guests: number;

  @ApiPropertyOptional({
    example: 'Mesa cerca de la ventana',
    description: 'Notas',
  })
  notes?: string;

  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.CANCELLED,
    description: 'Estado',
  })
  status: ReservationStatus;

  @ApiProperty({ example: '2026-10-08T20:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-08T22:30:00.000Z' })
  updatedAt: Date;
}
