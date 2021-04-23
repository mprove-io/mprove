import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { NavState, NavStore } from '../stores/nav.store';

@Injectable({ providedIn: 'root' })
export class NavQuery extends Query<NavState> {
  avatarSmall$ = this.select(state => state.avatarSmall);
  avatarBig$ = this.select(state => state.avatarBig);

  constructor(protected store: NavStore) {
    super(store);
  }
}
