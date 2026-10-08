import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PublicMenuService } from './public-menu.service.js';
import { CreatePublicMenuDto } from './dto/create-public-menu.dto.js';
import { UpdatePublicMenuDto } from './dto/update-public-menu.dto.js';

@Controller('api/v1/menu')
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}

  @Post()
  create(@Body() createPublicMenuDto: CreatePublicMenuDto) {
    return this.publicMenuService.create(createPublicMenuDto);
  }

  @Get()
  findMenu(){
    return this.publicMenuService.findMenu()
  }

  @Get()
  findAll() {
    return this.publicMenuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicMenuService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublicMenuDto: UpdatePublicMenuDto) {
    return this.publicMenuService.update(+id, updatePublicMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicMenuService.remove(+id);
  }
}
