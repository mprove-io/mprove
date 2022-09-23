import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import {
  EnvironmentsState,
  EnvironmentsStore
} from '../stores/environments.store';

@Injectable({ providedIn: 'root' })
export class EnvironmentsQuery extends Query<EnvironmentsState> {
  environments$ = this.select(state => state.environments);
  total$ = this.select(state => state.total);

  constructor(protected store: EnvironmentsStore) {
    super(store);
  }
}
