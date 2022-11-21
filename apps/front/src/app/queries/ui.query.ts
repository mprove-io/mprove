import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { UiState, UiStore } from '../stores/ui.store';

@Injectable({ providedIn: 'root' })
export class UiQuery extends Query<UiState> {
  needSave$ = this.select(state => state.needSave);
  isDiff$ = this.select(state => state.isDiff);

  constructor(protected store: UiStore) {
    super(store);
  }
}
