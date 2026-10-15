import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { productStatus } from '../enum/interface.js';

export class UpdateProductStatusDto {
  @ApiProperty({
    description: 'Estado general del producto',
    enum: productStatus,
    example: productStatus.ACTIVE,
  })
  @IsNotEmpty({ message: 'El estado del producto no puede estar vacío' })
  @IsEnum(productStatus, {
    message: 'El estado del producto debe ser "ACTIVE" o "INACTIVE"',
  })
  status: productStatus;
}
