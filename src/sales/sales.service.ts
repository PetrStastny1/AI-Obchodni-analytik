import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly repo: Repository<Sale>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  create(data: {
    date: Date;
    product: string;
    quantity: number;
    price: number;
  }) {
    const sale = this.repo.create(data);
    return this.repo.save(sale);
  }
}
