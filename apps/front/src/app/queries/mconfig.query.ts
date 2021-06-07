import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { MconfigState, MconfigStore } from '../stores/mconfig.store';

@Injectable({ providedIn: 'root' })
export class MconfigQuery extends Query<MconfigState> {
  constructor(protected store: MconfigStore) {
    super(store);
  }
}
