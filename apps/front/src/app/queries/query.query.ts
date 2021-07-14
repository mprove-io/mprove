import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { QueryState, QueryStore } from '../stores/query.store';

export class Cell {
  value: string;
  fValue: string;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class QueryQuery extends Query<QueryState> {
  query$ = this.select(state => state.query);

  constructor(protected store: QueryStore) {
    super(store);
  }
}
