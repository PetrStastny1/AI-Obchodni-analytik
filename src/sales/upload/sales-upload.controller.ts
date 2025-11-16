import { Controller, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { SalesService } from '../sales.service';

@Controller('sales')
export class SalesUploadController {
  constructor(private readonly salesService: SalesService) {}

  @Post('upload-csv')
  async uploadCSV(@Req() req: FastifyRequest) {
    const file = await req.file();

    if (!file) {
      return { message: 'No file uploaded' };
    }

    const buffer = await file.toBuffer();
    const csvText = buffer.toString('utf8');

    const lines = csvText.trim().split('\n');
    const header = lines[0].split(',').map((h) => h.trim());
    const rows = lines.slice(1);

    let count = 0;

    for (const line of rows) {
      const values = line.split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      header.forEach((key, i) => {
        row[key] = values[i] ?? '';
      });

      await this.salesService.create({
        date: new Date(row.date),
        product: row.product,
        quantity: Number(row.quantity),
        price: Number(row.price),
      });

      count++;
    }

    return {
      message: 'CSV import dokončen',
      imported: count,
    };
  }
}
