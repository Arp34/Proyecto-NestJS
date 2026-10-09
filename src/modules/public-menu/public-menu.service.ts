import { Injectable } from '@nestjs/common';
import { CreatePublicMenuDto } from './dto/create-public-menu.dto.js';
import { UpdatePublicMenuDto } from './dto/update-public-menu.dto.js';
import { Category } from '../categories/entities/category.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryStatus } from '../categories/enum/category-status.enum.js';
import { productStatus } from '../product/enum/interface.js';

@Injectable()
export class PublicMenuService {

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

 async findMenu() {
  return await this.categoryRepository
    .createQueryBuilder('category')
    .leftJoinAndSelect(
      'category.products',
      'product',
      'product.status = :productStatus',
      { productStatus: productStatus.ACTIVE },
    )
    .where('category.status = :categoryStatus', {
      categoryStatus: CategoryStatus.ACTIVE,
    })
    .getMany();
}


  create(createPublicMenuDto: CreatePublicMenuDto) {
    return 'This action adds a new publicMenu';
  }

  findAll() {
    return `This action returns all publicMenu`;
  }

  findOne(id: number) {
    return `This action returns a #${id} publicMenu`;
  }

  update(id: number, updatePublicMenuDto: UpdatePublicMenuDto) {
    return `This action updates a #${id} publicMenu`;
  }

  remove(id: number) {
    return `This action removes a #${id} publicMenu`;
  }
}
