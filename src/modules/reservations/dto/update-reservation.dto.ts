import { PartialType } from '@nestjs/swagger';
import { CreateReservationDto } from './create-reservation.dto.js';
import { IsEnum, IsOptional } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity.js';

export class UpdateReservationDto extends PartialType(CreateReservationDto) {
    @IsOptional()
    @IsEnum(ReservationStatus)
    status?: ReservationStatus;
}
