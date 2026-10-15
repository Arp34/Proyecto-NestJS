import { Injectable } from '@nestjs/common';
import { Category } from '../categories/entities/category.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryStatus } from '../categories/enum/category-status.enum.js';
import { productStatus } from '../product/enum/interface.js';
import { Product } from '../product/entities/product.entity.js';

@Injectable()
export class PublicMenuService {

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
   
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product> 
    
  ){} 
  
  
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


async findProductByCategory(categoryId: string) {
  return await this.productRepository.find({

    where:{
      category:{
        id: categoryId,
      },
      status: productStatus.ACTIVE,
    }

  })
}

}