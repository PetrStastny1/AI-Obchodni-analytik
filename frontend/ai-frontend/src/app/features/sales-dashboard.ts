import { Component, OnInit } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import {
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexStroke,
  ApexPlotOptions,
  ApexTitleSubtitle,
  ApexGrid
} from 'ng-apexcharts';

export type ChartOptions = {
  series?: ApexAxisChartSeries;
  chart?: ApexChart;
  xaxis?: ApexXAxis;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  plotOptions?: ApexPlotOptions;
  title?: ApexTitleSubtitle;
  grid?: ApexGrid;
};

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [
    NgApexchartsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    CurrencyPipe,
    DatePipe
  ],
  templateUrl: './sales-dashboard.html',
  styleUrls: ['./sales-dashboard.scss']
})
export class SalesDashboardComponent implements OnInit {
  sales: any[] = [];
  totalSales = 0;
  orderCount = 0;
  avgBasket = 0;

  salesSeries: ApexAxisChartSeries = [];
  productSeries: ApexAxisChartSeries = [];
  chartOptions: Partial<ChartOptions> = {};
  chartOptionsBar: Partial<ChartOptions> = {};

  constructor(private apollo: Apollo, private router: Router) {}

  ngOnInit(): void {
    this.apollo
      .watchQuery({
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
      })
      .valueChanges.subscribe(({ data }: any) => {
        this.sales = data?.sales ?? [];
        this.orderCount = this.sales.length;
        this.totalSales = this.sales.reduce(
          (a: number, s: any) => a + s.quantity * s.price,
          0
        );
        this.avgBasket = this.orderCount ? this.totalSales / this.orderCount : 0;
        this.buildRevenueByDayChart();
        this.buildTopProductsChart();
      });
  }

  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark-mode');
  }

  getTextColor(): string {
    return this.isDarkMode() ? '#FFFFFF' : '#000000';
  }

  buildRevenueByDayChart() {
    const map = new Map<string, number>();
    for (const s of this.sales) {
      const date = new Date(s.date).toISOString().slice(0, 10);
      map.set(date, (map.get(date) || 0) + s.quantity * s.price);
    }

    const labels = [...map.keys()].sort();
    const values = labels.map(d => map.get(d) || 0);
    this.salesSeries = [{ name: 'Tržby', data: values }];

    this.chartOptions = {
      chart: {
        type: 'line',
        height: 300,
        toolbar: { show: false },
        animations: { enabled: true },
        foreColor: this.getTextColor(),
        events: {
          dataPointSelection: (_e, _ctx, cfg) => {
            const index = cfg.dataPointIndex;
            const date = labels[index];
            this.router.navigate(['/sales'], { queryParams: { date } });
          }
        }
      },
      xaxis: { categories: labels },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
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

    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);
    this.productSeries = [{ name: 'Tržby', data: values }];

    this.chartOptionsBar = {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        animations: { enabled: true },
        foreColor: this.getTextColor(),
        events: {
          dataPointSelection: (_e, _ctx, cfg) => {
            const index = cfg.dataPointIndex;
            const product = labels[index];
            this.router.navigate(['/sales'], { queryParams: { product } });
          }
        }
      },
      xaxis: { categories: labels },
      dataLabels: { enabled: false },
      plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
      stroke: { width: 1 },
      title: { text: 'Top produkty podle tržeb' }
    };
  }
}
