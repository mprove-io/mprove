import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type { LlmModelWithProvider } from '#common/zod/backend/llm-models/llm-model-with-provider';
import { BaseQuery } from './base.query';

export class SessionModelsState {
  modelsOpencode: LlmModelWithProvider[];
  modelsAi: LlmModelWithProvider[];
}

let sessionModelsState: SessionModelsState = {
  modelsOpencode: [],
  modelsAi: []
};

@Injectable({ providedIn: 'root' })
export class SessionModelsQuery extends BaseQuery<SessionModelsState> {
  modelsOpencode$ = this.store.pipe(select(state => state.modelsOpencode));
  modelsAi$ = this.store.pipe(select(state => state.modelsAi));

  constructor() {
    super(
      createStore(
        { name: 'sessionModels' },
        withProps<SessionModelsState>(sessionModelsState)
      )
    );
  }
}
