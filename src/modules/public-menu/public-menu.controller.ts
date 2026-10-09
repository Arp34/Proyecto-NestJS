import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PublicMenuService } from './public-menu.service.js';
import { CreatePublicMenuDto } from './dto/create-public-menu.dto.js';
import { UpdatePublicMenuDto } from './dto/update-public-menu.dto.js';

@Controller('public-menu')
export class PublicMenuController {
  constructor(private readonly publicMenuService: PublicMenuService) {}


  @Get()
  findMenu(){
    return this.publicMenuService.findMenu()
  }

}