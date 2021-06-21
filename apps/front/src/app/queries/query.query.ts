import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { QueryService } from '../services/query.service';
import { QueryState, QueryStore } from '../stores/query.store';
import { ColumnField, MconfigQuery } from './mconfig.query';

export class RData {
  [k: string]: Cell;
}

export class Cell {
  value: string;
  fValue: string;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class QueryQuery extends Query<QueryState> {
  data$ = this.select(state => state.data);

  qData$ = combineLatest([
    this.mconfigQuery.selectModelFields$,
    this.data$
  ]).pipe(
    map(([fields, data]: [ColumnField[], any[]]) =>
      // console.log('combineLatest');
      // console.log(data);
      // console.log(fields);
      this.queryService.makeQData({ data: data, columns: fields })
    )
  );

  constructor(
    protected store: QueryStore,
    private queryService: QueryService,
    private mconfigQuery: MconfigQuery
  ) {
    super(store);
  }
}
