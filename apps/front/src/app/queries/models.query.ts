import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { ModelX } from '#common/interfaces/backend/model-x';
import { BaseQuery } from './base.query';

export class ModelsState {
  models: ModelX[];
}

let modelsState: ModelsState = {
  models: []
};

@Injectable({ providedIn: 'root' })
export class ModelsQuery extends BaseQuery<ModelsState> {
  models$ = this.store.pipe(select(state => state.models));

  constructor() {
    super(createStore({ name: 'models' }, withProps<ModelsState>(modelsState)));
  }
}
