import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { MqState, MqStore } from '../stores/mq.store';

@Injectable({ providedIn: 'root' })
export class MqQuery extends Query<MqState> {
  query$ = this.select(state => state.query);
  mconfig$ = this.select(state => state.mconfig);

  constructor(protected store: MqStore) {
    super(store);
  }
}
