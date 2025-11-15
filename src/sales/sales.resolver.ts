import { Resolver, Query } from '@nestjs/graphql';
import { SalesService } from './sales.service';
import { Sale } from './sale.entity';

@Resolver(() => Sale)
export class SalesResolver {
  constructor(private readonly salesService: SalesService) {}

  @Query(() => [Sale], { name: 'sales' })
  async getSales(): Promise<Sale[]> {
    return this.salesService.findAll();
  }
}
