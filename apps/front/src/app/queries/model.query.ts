import { Injectable } from '@angular/core';
import { Query } from '@datorama/akita';
import { ModelState, ModelStore } from '../stores/model.store';

@Injectable({ providedIn: 'root' })
export class ModelQuery extends Query<ModelState> {
  constructor(protected store: ModelStore) {
    super(store);
  }
}
