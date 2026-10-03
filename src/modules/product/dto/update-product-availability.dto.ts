import { IsEnum } from 'class-validator';
import { productAvailability } from '../enum/interface.js';

export class UpdateProductAvailabilityDto {
  @IsEnum(productAvailability)
  availability: productAvailability;
}
