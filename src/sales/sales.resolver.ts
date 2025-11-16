import { Resolver, Query } from '@nestjs/graphql';
import { SalesService } from './sales.service';
import { Sale } from './sale.entity';

@Resolver(() => Sale)
export class SalesResolver {
  constructor(private readonly salesService: SalesService) {}

  @Query(() => [Sale])
  async sales(): Promise<Sale[]> {
    return this.salesService.findAll();
  }
}
