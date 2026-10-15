import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TablesService } from './tables.service.js';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';
import { UpdateTableStatusDto } from './dto/update-table-status.dto.js';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('tables')
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva mesa' })
  @ApiResponse({ status: 201, description: 'Mesa creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud inválida.' })
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las mesas' })
  @ApiResponse({ status: 200, description: 'Mesas obtenidas exitosamente.' })
  @ApiResponse({ status: 404, description: 'No se encontraron mesas.' })
  findAll() {
    return this.tablesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una mesa por ID' })
  @ApiParam({ name: 'id', description: 'ID de la mesa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Mesa obtenida exitosamente.' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una mesa por ID' })
  @ApiParam({ name: 'id', description: 'ID de la mesa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Mesa actualizada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, updateTableDto);
  }

  // NUEVO
  @Patch(':id/status')
  @ApiOperation({ summary: 'Actualizar el estado operativo de una mesa' })
  @ApiParam({ name: 'id', description: 'ID de la mesa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Estado no válido.' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada.' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(id, dto.status);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una mesa por ID' })
  @ApiParam({ name: 'id', description: 'ID de la mesa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Mesa eliminada exitosamente.' })
  @ApiResponse({ status: 404, description: 'Mesa no encontrada.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tablesService.remove(id);
  }
}
