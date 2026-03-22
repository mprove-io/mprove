import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { SessionModelApi } from '#common/interfaces/backend/session-model-api';
import { BaseQuery } from './base.query';

export class AgentModelsState {
  modelsOpencode: SessionModelApi[];
  modelsAi: SessionModelApi[];
}

let agentModelsState: AgentModelsState = {
  modelsOpencode: [],
  modelsAi: []
};

@Injectable({ providedIn: 'root' })
export class AgentModelsQuery extends BaseQuery<AgentModelsState> {
  modelsOpencode$ = this.store.pipe(select(state => state.modelsOpencode));
  modelsAi$ = this.store.pipe(select(state => state.modelsAi));

  constructor() {
    super(
      createStore(
        { name: 'agentModels' },
        withProps<AgentModelsState>(agentModelsState)
      )
    );
  }
}
