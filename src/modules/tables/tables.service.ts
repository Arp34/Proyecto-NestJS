import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTableDto } from './dto/create-table.dto.js';
import { UpdateTableDto } from './dto/update-table.dto.js';
import { Table } from './entities/table.entity.js';
import { TableStatus } from './enums/table-status.enum.js';

@Injectable()
export class TablesService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto): Promise<Table> {
    const existingTable = await this.tableRepository.findOne({
      where: { number: createTableDto.number },
    });

    if (existingTable) {
      throw new ConflictException(
        `La mesa con el número ${createTableDto.number} ya está registrada.`,
      );
    }

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
    const table = await this.tableRepository.preload(
      Object.assign({ id }, updateTableDto),
    );

    if (!table) {
      throw new NotFoundException(
        `No se puede actualizar. La mesa con el ID #${id} no existe`,
      );
    }

    return await this.tableRepository.save(table);
  }

  async remove(id: string): Promise<void> {
    const table = await this.findOne(id);
    await this.tableRepository.remove(table);
  }

  // NUEVO: PATCH /tables/:id/status
  async updateStatus(id: string, status: TableStatus): Promise<Table> {
    const table = await this.findOne(id); // 404 controlado si no existe
    table.status = status;
    return await this.tableRepository.save(table);
  }

  // NUEVO - RN-019: para que lo usen reservas y pedidos
  async assertTableUsable(id: string): Promise<Table> {
    const table = await this.findOne(id);
    if (table.status === TableStatus.OUT_OF_SERVICE) {
      throw new ConflictException(
        `La mesa #${table.number} está fuera de servicio`,
      );
    }
    return table;
  }
}