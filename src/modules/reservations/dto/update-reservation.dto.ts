import { ApiPropertyOptional,  OmitType,  PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity.js';

export class UpdateReservationDto extends PartialType(
  OmitType(CreateReservationDto, ['customer_id', 'customer'] as const),
 ) {
  @ApiPropertyOptional({
    enum: ReservationStatus,
    description: 'Estado de la reserva',
    example: ReservationStatus.PENDING,
  })
  //ya
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;
}
