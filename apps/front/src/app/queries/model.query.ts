import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ModelState, ModelStore } from '../stores/model.store';

@Injectable({ providedIn: 'root' })
export class ModelQuery extends Query<ModelState> {
  fields$ = this.select(state => state.fields);

  constructor(protected store: ModelStore) {
    super(store);
  }
}
