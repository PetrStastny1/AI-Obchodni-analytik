import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Apollo, gql } from 'apollo-angular';

const GET_SALES = gql`
  query {
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
  selector: 'app-sales-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './sales-page.html',
  styleUrls: ['./sales-page.scss']
})
export class SalesPage implements OnInit {
  displayedColumns = ['date', 'product', 'quantity', 'sale_price', 'revenue'];

  sales: any[] = [];
  loading = true;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.apollo.watchQuery<any>({ query: GET_SALES })
      .valueChanges.subscribe(({ data }) => {
        this.sales = (data?.sales ?? []).map((s: any) => ({
          ...s,
          sale_price: Number(s.sale_price),
          revenue: Number(s.sale_price) * Number(s.quantity)
        }));
        this.loading = false;
      });
  }
}
