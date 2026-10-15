import { Module } from '@nestjs/common';
import { PublicMenuService } from './public-menu.service.js';
import { PublicMenuController } from './public-menu.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../categories/entities/category.entity.js';
import { Product } from '../product/entities/product.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product])],
  controllers: [PublicMenuController],
  providers: [PublicMenuService],
})
export class PublicMenuModule {}
