import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty } from 'class-validator';
import { TABLE_STATUSES, TableStatus } from '../enums/table-status.enum.js';

export class UpdateTableStatusDto {
  @ApiProperty({ enum: TableStatus, example: TableStatus.OCCUPIED })
  @IsNotEmpty()
  @IsIn(TABLE_STATUSES, {
    message: `status debe ser uno de: ${TABLE_STATUSES.join(', ')}`,
  })
  status: TableStatus;
}
