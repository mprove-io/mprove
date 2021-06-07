import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { QueryState, QueryStore } from '../stores/query.store';

@Injectable({ providedIn: 'root' })
export class QueryQuery extends Query<QueryState> {
  constructor(protected store: QueryStore) {
    super(store);
  }
}
