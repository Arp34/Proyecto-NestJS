import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateReservationDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del cliente',
  })
  @IsUUID()
  customer_id: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID de la mesa',
  })
  @IsOptional()
  @IsUUID()
  table_id?: string;

  @ApiProperty({
    example: '2026-09-30',
    description: 'Fecha de la reserva',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    example: '19:30',
    description: 'Hora de la reserva',
  })
  @IsString()
  time: string;

  @ApiProperty({
    example: 4,
    description: 'Cantidad de personas',
  })
  @IsInt()
  @Min(1)
  guests: number;

  @ApiPropertyOptional({
    example: 'PENDING',
    description: 'Estado de la reserva',
    default: 'PENDING',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
