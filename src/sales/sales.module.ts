import { Module } from '@nestjs/common';
import { SalesService } from './sales.service';
import { SalesResolver } from './sales.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from './sale.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale])],
  providers: [SalesService, SalesResolver],
})
export class SalesModule {}
