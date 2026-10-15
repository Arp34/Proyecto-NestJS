import { Controller, Get} from '@nestjs/common';
import { PublicMenuService } from './public-menu.service.js';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public Menu')
@Controller('public-menu')
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}


  @Get()
  @ApiOperation({
    summary: 'Obtener el menu publico del restaurante',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu publico obtenido correctamente',
  })
  findMenu(){
    return this.publicMenuService.findMenu()
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({
    summary: 'Obtener productos activos de una categoria'
  })

}