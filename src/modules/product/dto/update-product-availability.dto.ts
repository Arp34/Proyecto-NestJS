import { IsEnum, IsNotEmpty } from 'class-validator';
import { productAvailability } from '../enum/interface.js';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductAvailabilityDto {
  @ApiProperty({
    description: 'Estado general del producto',
    enum: productAvailability,
    example: productAvailability.AVAILABLE,
  })
  @IsNotEmpty({ message: 'La disponibilidad no puede estar vacía' })
  @IsEnum(productAvailability, {
    message:
      'La disponibilidad del producto debe ser "AVAILABLE" o "UNAVAILABLE"',
  })
  availability: productAvailability;
}
