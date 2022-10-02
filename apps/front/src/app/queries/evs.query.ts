import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { EvsState, EvsStore } from '../stores/evs.store';

@Injectable({ providedIn: 'root' })
export class EvsQuery extends Query<EvsState> {
  evs$ = this.select(state => state.evs);

  constructor(protected store: EvsStore) {
    super(store);
  }
}
