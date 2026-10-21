import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

import { PublicMenuService } from './public-menu.service.js';

@ApiTags('Public Menu')
@Controller('menu')
export class PublicMenuController {
  constructor(
    private readonly publicMenuService: PublicMenuService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener el menú público del restaurante',
    description:
      'Retorna las categorías activas con sus productos activos, incluyendo los que no tienen inventario.',
  })
  @ApiResponse({
    status: 200,
    description: 'Menú público obtenido correctamente',
  })
  findMenu() {
    return this.publicMenuService.findMenu();
  }

  @Get('categories/:categoryId/products')
  @ApiOperation({
    summary: 'Obtener productos activos de una categoría',
    description:
      'Retorna los productos activos de una categoría que también debe estar activa.',
  })
  @ApiParam({
    name: 'categoryId',
    description: 'Identificador de la categoría',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Productos de la categoría obtenidos correctamente',
  })
  @ApiResponse({
    status: 404,
    description: 'La categoría no existe o está inactiva',
  })
  findProductsByCategory(
    @Param('categoryId') categoryId: string,
  ) {
    return this.publicMenuService.findProductByCategory(categoryId);
  }
}