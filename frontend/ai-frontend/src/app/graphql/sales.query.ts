import { gql } from 'apollo-angular';

export const GET_SALES = gql`
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
