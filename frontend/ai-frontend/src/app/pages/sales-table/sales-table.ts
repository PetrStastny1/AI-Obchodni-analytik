import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo } from 'apollo-angular';
import { GET_SALES } from '../../graphql/sales.query';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-sales-table',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './sales-table.html',
  styleUrls: ['./sales-table.scss'],
})
export class SalesTable {
  private apollo = inject(Apollo);

  displayedColumns = ['date', 'product', 'quantity', 'sale_price', 'revenue'];
  dataSource: any[] = [];

  isMobile = signal(window.innerWidth < 768);

  constructor() {
    this.apollo.watchQuery({ query: GET_SALES }).valueChanges.subscribe((res: any) => {
      const sales = res?.data?.sales ?? [];

      this.dataSource = sales.map((s: any) => ({
        ...s,
        sale_price: Number(s.sale_price),
        revenue: Number(s.quantity) * Number(s.sale_price),
      }));
    });

    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth < 768);
    });
  }
}
