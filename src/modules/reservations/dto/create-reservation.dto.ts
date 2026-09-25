import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

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
    example: 'Mesa cerca de la ventana',
    description: 'Estado de la reserva',
    default: 'PENDING',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? undefined : trimmed;
  })
  @IsString()
  @MaxLength(255)
  notes?: string;
}
