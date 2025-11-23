import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AiChatService {
  constructor(private apollo: Apollo) {}

  ask(question: string): Observable<any> {
    return this.apollo
      .query({
        query: gql`
          query AskAI($q: String!) {
            askAI(question: $q) {
              sql
              rawResultJson
              summary
            }
          }
        `,
        variables: { q: question }
      })
      .pipe(
        map((res: any) => res.data.askAI)
      );
  }
}
