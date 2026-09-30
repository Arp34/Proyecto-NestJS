import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from './entities/product.entity.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // CRUD operations for Product entity

  async create(createProductDto: CreateProductDto) {
    const name = createProductDto.name;
    const description = createProductDto.description;
    const imageUrl = createProductDto.imageUrl;

    // Create a new product entity and save it to the database
    const newProduct = this.productRepository.create({
      name: name,
      description: description,
      price: createProductDto.price,
      category: { id: createProductDto.category_id },
      availability: createProductDto.availability,
      status: createProductDto.status,
      imageUrl: imageUrl,
    });

    return await this.productRepository.save(newProduct);
  }

  async findAll() {
    return await this.productRepository.find();
  }

  // Find a product by ID with error handling

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException({
        message: `El producto con ID${id} no fue encontrado`,
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }
    return product;
  }

  // Update and remove methods for Product entity

  async update(id: string, updateProductDto: UpdateProductDto) {
    const productUpdate = await this.findOne(id);

    this.productRepository.merge(productUpdate, updateProductDto);

    return await this.productRepository.save(productUpdate);
  }

  async remove(id: string) {
    const productRemove = await this.findOne(id);

    return await this.productRepository.remove(productRemove);
  }
}
