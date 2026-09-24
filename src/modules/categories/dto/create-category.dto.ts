import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
<<<<<<< HEAD
=======
import { Transform } from 'class-transformer';
>>>>>>> origin/feature/customers
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryStatus } from '../enum/category-status.enum.js';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Nombre de la categoría', example: 'Postres' })
<<<<<<< HEAD
=======
  @Transform(({ value }) => value?.trim())
>>>>>>> origin/feature/customers
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre no puede exceder los 100 caracteres' })
  name: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Todos los postres fríos y calientes',
  })
<<<<<<< HEAD
=======
  @Transform(({ value }) => value?.trim())
>>>>>>> origin/feature/customers
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Estado de la categoría',
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  @IsEnum(CategoryStatus, {
    message: 'El estado solo puede ser ACTIVE o INACTIVE',
  })
  @IsOptional()
  status?: CategoryStatus;
}
