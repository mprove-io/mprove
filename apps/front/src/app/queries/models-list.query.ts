import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ModelsListState, ModelsListStore } from '../stores/models-list.store';

@Injectable({ providedIn: 'root' })
export class ModelsListQuery extends Query<ModelsListState> {
  modelsList$ = this.select(state => state.modelsList);
  allModelsList$ = this.select(state => state.allModelsList);

  constructor(protected store: ModelsListStore) {
    super(store);
  }
}