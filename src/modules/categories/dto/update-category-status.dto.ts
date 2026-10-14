import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryStatus } from '../enum/category-status.enum.js';

export class UpdateCategoryStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la categoría',
    enum: CategoryStatus,
    example: CategoryStatus.INACTIVE,
  })
  @IsNotEmpty({ message: 'El estado no puede estar vacío' })
  @IsEnum(CategoryStatus, {
    message: 'El estado solo puede ser ACTIVE o INACTIVE (RN-024)',
  })
  status: CategoryStatus;
}
