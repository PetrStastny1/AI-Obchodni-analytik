import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Apollo, gql } from 'apollo-angular';

const GET_SALES = gql`
  query {
    sales {
      id
      date
      product
      quantity
      price
    }
  }
`;

@Component({
  selector: 'app-sales-page',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './sales-page.html',
  styleUrls: ['./sales-page.scss']
})
export class SalesPage implements OnInit {
  displayedColumns = ['date', 'product', 'quantity', 'price', 'revenue'];
  sales = [];
  loading = true;

  constructor(private apollo: Apollo) {}

  ngOnInit() {
    this.apollo.watchQuery<any>({ query: GET_SALES })
      .valueChanges.subscribe(({ data }) => {
        this.sales = data.sales;
        this.loading = false;
      });
  }
}
