import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { VizsState, VizsStore } from '../stores/vizs.store';

@Injectable({ providedIn: 'root' })
export class VizsQuery extends Query<VizsState> {
  vizs$ = this.select(state => state.vizs);

  constructor(protected store: VizsStore) {
    super(store);
  }
}
