import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ModelsState, ModelsStore } from '../stores/models.store';

@Injectable({ providedIn: 'root' })
export class ModelsQuery extends Query<ModelsState> {
  model$ = this.select(state => state.models);

  constructor(protected store: ModelsStore) {
    super(store);
  }
}
