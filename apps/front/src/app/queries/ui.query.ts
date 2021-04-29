import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UiState, UiStore } from '../stores/ui.store';

@Injectable({ providedIn: 'root' })
export class UiQuery extends Query<UiState> {
  openedMenuId$ = this.select(state => state.openedMenuId);

  constructor(protected store: UiStore) {
    super(store);
  }
}
