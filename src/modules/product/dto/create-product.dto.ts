import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  Length,
  IsNumber,
  IsEnum,
  IsUrl,
  IsOptional,
  IsPositive,
} from 'class-validator';
import { productAvailability, productStatus } from '../enum/interface.js';

export class CreateProductDto {
  @ApiProperty({
    example: 'Producto de ejemplo',
    description: 'Nombre del producto',
  })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @Length(2, 120, { message: 'El nombre debe tener entre 2 y 120 caracteres' })
  name: string;

  @ApiProperty({
    example: 'Descripción del producto',
    description: 'Descripción del producto',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @Length(2, 500, {
    message: 'La descripción debe tener entre 2 y 500 caracteres',
  })
  description: string;

  @ApiProperty({
    example: 19.99,
    description: 'Precio del producto',
  })
  @IsNotEmpty({ message: 'El precio es requerido' })
  @IsPositive({ message: 'El precio debe ser un número positivo' })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'El precio debe ser un número' },
  )
  price: number;

  @ApiProperty({
    example: 'ID de la categoría',
    description: 'ID de la categoría a la que pertenece el producto',
  })
  @IsNotEmpty({ message: 'El ID de la categoría es requerido' })
  @IsUUID(4, { message: 'El ID de la categoría debe ser un UUID válido' })
  category_id: string;

  @ApiProperty({
    description: 'Disponibilidad del producto',
    enum: productAvailability,
    default: productAvailability.AVAILABLE,
  })
  @IsEnum(productAvailability)
  @IsOptional()
  availability: productAvailability;

  @ApiProperty({
    description: 'Estado del producto',
    enum: productStatus,
    default: productStatus.ACTIVE,
  })
  @IsEnum(productStatus)
  @IsOptional()
  status: productStatus;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    description: 'URL de la imagen del producto',
  })
  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  @IsUrl(
    { protocols: ['http', 'https'] },
    { message: 'La URL de la imagen debe ser una dirección web válida' },
  )
  imageUrl: string;
}
