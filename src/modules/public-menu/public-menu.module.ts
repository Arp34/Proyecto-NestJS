import { Module } from '@nestjs/common';
import { PublicMenuService } from './public-menu.service.js';
import { PublicMenuController } from './public-menu.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [PublicMenuController],
  providers: [PublicMenuService],
})
export class PublicMenuModule {}
