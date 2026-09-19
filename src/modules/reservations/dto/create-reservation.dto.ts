import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsDateString,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
} from 'class-validator'

export class CreateReservationDto {
    @ApiProperty({
        description: 'UUID del cliente que realiza la reserva',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsUUID()
    customer_id!: string;

    @ApiPropertyOptional({
        description: 'UUID de la mesa asignada a la reserva',
        example: '550e8400-e29b-41d4-a716-446655440001',
    })

    @IsOptional()
    @IsUUID()
    table_id?: string

    @ApiProperty({
        description: 'Fecha de la reserva',
        example: '2026-09-20',
    })
    @IsDateString()
    date!: string;

    @ApiProperty({
        description: 'Hora de la reserva',
        example: '19:30',
    })
    @IsString()
    time!: string;

    @ApiProperty({
        description: 'Cantidad de personas para la reserva',
        example: 4,
    })
    @IsInt()
    @IsPositive()
    guests!: number;

    @ApiPropertyOptional({
        description: 'Notas adicionales de la reserva',
        example: 'Mesa cerca de la ventana',
    })
    @IsOptional()
    @IsString()
    notes?: string;
}
