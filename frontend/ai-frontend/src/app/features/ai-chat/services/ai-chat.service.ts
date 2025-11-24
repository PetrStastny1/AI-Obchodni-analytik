import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  constructor(private apollo: Apollo) {}

  // 🔥 GraphQL dotaz
  private ASK_AI = gql`
    query AskAI($q: String!) {
      askAI(question: $q) {
        sql
        summary
        rawResultJson
        chart {
          categories
          values
        }
      }
    }
  `;

  // 🧠 Metoda pro volání
  ask(question: string): Observable<any> {
    return this.apollo
      .query({
        query: this.ASK_AI,
        variables: { q: question }
      })
      .pipe(map((res: any) => res.data.askAI));
  }
}
