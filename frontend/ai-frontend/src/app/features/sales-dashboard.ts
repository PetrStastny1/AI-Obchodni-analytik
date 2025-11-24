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

import { ImportCsvComponent } from './import-csv/import-csv';

type SaleItem = {
  id: number;
  date: string;
  product: string;
  quantity: number;
  sale_price: number;
};

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

// 🟦 Dotazy
const CHECK_EMPTY = gql`
  query CheckEmpty {
    sales {
      id
    }
  }
`;

const GET_SALES = gql`
  query GetSales {
    sales {
      id
      date
      product
      quantity
      sale_price
    }
  }
`;

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
  sales: SaleItem[] = [];

  totalSales = 0;
  orderCount = 0;
  avgBasket = 0;

  hasData = false;

  salesSeries: ApexAxisChartSeries = [];
  productSeries: ApexAxisChartSeries = [];

  chartOptions: Partial<ChartOptions> = {};
  chartOptionsBar: Partial<ChartOptions> = {};

  constructor(private apollo: Apollo, private router: Router) {}

  ngOnInit(): void {
    // 1) 👉 zkontrolujeme, jestli existují data
    this.apollo
      .watchQuery({
        query: CHECK_EMPTY,
        fetchPolicy: 'network-only'
      })
      .valueChanges.subscribe(({ data }: any) => {
        const exists = (data?.sales ?? []).length > 0;
        this.hasData = exists;
        if (exists) this.loadFullSales();
      });

    // 2) 🟢 posloucháme refresh po uploadu CSV
    ImportCsvComponent.refreshDashboard.subscribe(() => {
      this.loadFullSales();
    });
  }

  // 🔄 Načtení dashboardu
  private loadFullSales() {
    this.apollo
      .watchQuery({
        query: GET_SALES,
        fetchPolicy: 'network-only' // ⚡ vždy čerstvá data
      })
      .valueChanges.subscribe(({ data }: any) => {
        this.sales = (data?.sales ?? []).map((s: any) => ({
          ...s,
          sale_price: Number(s.sale_price)
        }));

        // 💰 KPI
        this.orderCount = this.sales.length;
        this.totalSales = this.sales.reduce(
          (a: number, s: SaleItem) => a + s.quantity * s.sale_price,
          0
        );
        this.avgBasket = this.orderCount ? this.totalSales / this.orderCount : 0;

        // ❌ Pokud mezitím někdo data smazal
        if (this.sales.length === 0) {
          this.hasData = false;
          return;
        }

        // 📈 Grafy
        this.buildRevenueByDayChart();
        this.buildTopProductsChart();
      });
  }

  // ☀️ / 🌙 Helpery
  isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark-mode');
  }
  getTextColor(): string {
    return this.isDarkMode() ? '#FFFFFF' : '#000000';
  }

  // 📈 Graf 1: Tržby podle dne
  buildRevenueByDayChart() {
    const map = new Map<string, number>();
    for (const s of this.sales) {
      if (!s.date) continue;
      const date = new Date(s.date).toISOString().slice(0, 10);
      map.set(date, (map.get(date) || 0) + s.quantity * s.sale_price);
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
        foreColor: this.getTextColor()
      },
      xaxis: { categories: labels },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      title: { text: 'Tržby podle dne' }
    };
  }

  // 📊 Graf 2: Top produkty
  buildTopProductsChart() {
    const map = new Map<string, number>();
    for (const s of this.sales) {
      map.set(s.product, (map.get(s.product) || 0) + s.quantity * s.sale_price);
    }

    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const labels = entries.map(e => e[0]);
    const values = entries.map(e => e[1]);

    this.productSeries = [{ name: 'Tržby', data: values }];

    this.chartOptionsBar = {
      chart: {
        type: 'bar',
        height: 300,
        toolbar: { show: false },
        animations: { enabled: true },
        foreColor: this.getTextColor()
      },
      xaxis: { categories: labels },
      dataLabels: { enabled: false },
      plotOptions: { bar: { horizontal: false, borderRadius: 4 } },
      stroke: { width: 1 },
      title: { text: 'Top produkty podle tržeb' }
    };
  }
}
