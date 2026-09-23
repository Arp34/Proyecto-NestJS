import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateTableDto } from './create-table.dto.js'; // Asegúrate de quitar el .js si estás en TypeScript
import { IsUUID, IsOptional } from 'class-validator';

// Ahora PartialType viene de @nestjs/swagger
export class UpdateTableDto extends PartialType(CreateTableDto) {
  // Opcional: Generalmente el ID va en la URL (@Param) y no en el body (@Body).
  // Si decides enviarlo también en el body, asegúrate de validarlo.
  @ApiProperty({
    description: 'UUID de la mesa',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false, // Es un PATCH, podría no venir en el body
  })
  @IsOptional()
  @IsUUID()
  id?: string;
}
