import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { UpdateProductStatusDto } from './dto/update-product-status.dto.js';
import { UpdateProductAvailabilityDto } from './dto/update-product-availability.dto.js';
import { Product } from './entities/product.entity.js';
import { productStatus } from './enum/interface.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    // Creamos la entidad mapeando el category_id a la relación de TypeORM
    const newProduct = this.productRepository.create({
      name: createProductDto.name,
      description: createProductDto.description,
      price: createProductDto.price,
      category: { id: createProductDto.category_id },
      imageUrl: createProductDto.imageUrl,
    });

    return await this.productRepository.save(newProduct);
  }

  async findAll() {
    return await this.productRepository.find({
      where: {
        status: productStatus.ACTIVE,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException({
        message: `El producto con ID ${id} no fue encontrado`,
        errorCode: 'PRODUCT_NOT_FOUND',
      });
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const productUpdate = await this.findOne(id);

    // Separamos el category_id del resto de los datos
    const { category_id, ...restUpdate } = updateProductDto;

    // Si viene una nueva categoría, la mapeamos a la relación
    if (category_id) {
      productUpdate.category = { id: category_id } as any;
    }

    // Hacemos el merge seguro con el resto de datos
    this.productRepository.merge(productUpdate, restUpdate);

    return await this.productRepository.save(productUpdate);
  }

  async updateStatus(id: string, updateStatusDto: UpdateProductStatusDto) {
    const product = await this.findOne(id);

    product.status = updateStatusDto.status;

    return await this.productRepository.save(product);
  }

  async updateAvailability(
    id: string,
    updateAvailabilityDto: UpdateProductAvailabilityDto,
  ) {
    const product = await this.findOne(id);

    product.availability = updateAvailabilityDto.availability;

    return await this.productRepository.save(product);
  }

  async remove(id: string) {
    const productRemove = await this.findOne(id);

    return await this.productRepository.remove(productRemove);
  }
}
