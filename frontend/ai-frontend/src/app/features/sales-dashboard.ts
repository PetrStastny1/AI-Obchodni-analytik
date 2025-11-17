import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Apollo, gql } from 'apollo-angular';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';

import {
  NgxApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexPlotOptions
} from 'ngx-apexcharts';

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NgxApexchartsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule
  ],
  templateUrl: './sales-dashboard.html',
  styleUrls: ['./sales-dashboard.scss']
})
export class SalesDashboardComponent implements OnInit {
  sales: any[] = [];
  displayedColumns = ['date', 'product', 'revenue'];

  revenueByDayChart: any = null;
  topProductsChart: any = null;

  totalRevenue = 0;
  totalOrders = 0;
  avgOrderValue = 0;

  constructor(private apollo: Apollo) {}

  ngOnInit(): void {
    this.apollo.watchQuery({
      query: gql`
        query GetSales {
          sales {
            id
            date
            product
            quantity
            price
          }
        }
      `
    }).valueChanges.subscribe(({ data }: any) => {
      this.sales = data?.sales ?? [];

      this.totalOrders = this.sales.length;
      this.totalRevenue = this.sales.reduce((a: number, s: any) => a + s.quantity * s.price, 0);
      this.avgOrderValue = this.totalOrders ? this.totalRevenue / this.totalOrders : 0;

      this.buildRevenueByDayChart();
      this.buildTopProductsChart();
    });
  }

  buildRevenueByDayChart() {
    const map = new Map<string, number>();

    for (const s of this.sales) {
      const date = new Date(s.date).toISOString().slice(0, 10);
      map.set(date, (map.get(date) || 0) + s.quantity * s.price);
    }

    const labels = [...map.keys()].sort();
    const values = labels.map(d => map.get(d) || 0);

    this.revenueByDayChart = {
      series: [{ name: 'Tržby', data: values }],
      chart: { type: 'line', height: 300 },
      xaxis: { categories: labels },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      plotOptions: { bar: { horizontal: false } },
      title: { text: 'Tržby podle dne' }
    };
  }

  buildTopProductsChart() {
    const map = new Map<string, number>();

    for (const s of this.sales) {
      map.set(s.product, (map.get(s.product) || 0) + s.quantity * s.price);
    }

    const entries = [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.topProductsChart = {
      series: [{ name: 'Tržby', data: entries.map(e => e[1]) }],
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: entries.map(e => e[0]) },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      plotOptions: { bar: { horizontal: false } },
      title: { text: 'Top produkty podle tržeb' }
    };
  }
}
