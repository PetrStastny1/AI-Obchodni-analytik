/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MercuriusDriver, MercuriusDriverConfig } from '@nestjs/mercurius';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    GraphQLModule.forRootAsync<MercuriusDriverConfig>({
      driver: MercuriusDriver,
      useFactory: () => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        path: '/graphql',
      }),
    }),

    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql' as const,
        host: '127.0.0.1',
        port: 3307,
        username: 'root',
        password: 'root',
        database: 'analytics',
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    SalesModule,
  ],
})
export class AppModule {}
