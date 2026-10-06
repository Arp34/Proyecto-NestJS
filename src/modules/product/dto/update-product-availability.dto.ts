import { IsEnum, IsNotEmpty } from 'class-validator';
import { productAvailability } from '../enum/interface.js';

export class UpdateProductAvailabilityDto {
  @IsNotEmpty({ message: 'La disponibilidad no puede estar vacía' })
  @IsEnum(productAvailability, {
    message:
      'La disponibilidad del producto debe ser "AVAILABLE" o "UNAVAILABLE"',
  })
  availability: productAvailability;
}
