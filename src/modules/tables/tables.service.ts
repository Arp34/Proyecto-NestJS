import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto } from './dto/create-table.dto.js'; // Quité el .js por estándar de Nest
import { UpdateTableDto } from './dto/update-table.dto.js';
import { Table } from './entities/table.entity.js'; // Asegúrate de que la ruta coincida con tu proyecto

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const newTable = this.tableRepository.create(createTableDto);
    return await this.tableRepository.save(newTable);
  }

  async findAll(): Promise<Table[]> {
    return await this.tableRepository.find();
  }

  async findOne(id: string): Promise<Table> {
    const table = await this.tableRepository.findOneBy({ id });
    
    if (!table) {
      throw new NotFoundException(`La mesa con el ID #${id} no fue encontrada`);
    }
    
    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto): Promise<Table> {
    // .preload() busca la entidad por id y sobreescribe los campos con los del DTO
    const table = await this.tableRepository.preload({
      id: id,
      ...updateTableDto,
    });

    if (!table) {
      throw new NotFoundException(`No se puede actualizar. La mesa con el ID #${id} no existe`);
    }

    return await this.tableRepository.save(table);
  }

  async remove(id: string): Promise<void> {
    // Reutilizamos el método findOne para verificar si existe antes de eliminarla
    const table = await this.findOne(id);
    await this.tableRepository.remove(table);
  }
}