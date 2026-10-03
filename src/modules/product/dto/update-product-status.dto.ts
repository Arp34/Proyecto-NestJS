import { IsEnum } from 'class-validator';
import { productStatus } from '../enum/interface.js';

export class UpdateProductStatusDto {
  @IsEnum(productStatus, {
    message: 'El estado del producto debe ser "ACTIVE" o "INACTIVE"',
  })
  status: productStatus;
}
