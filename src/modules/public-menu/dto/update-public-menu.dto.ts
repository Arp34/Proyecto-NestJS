import { PartialType } from '@nestjs/swagger';
import { CreatePublicMenuDto } from './create-public-menu.dto.js';

export class UpdatePublicMenuDto extends PartialType(CreatePublicMenuDto) {}
