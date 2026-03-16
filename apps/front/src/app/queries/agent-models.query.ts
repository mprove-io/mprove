import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { BaseQuery } from './base.query';

export class AgentModelsState {
  modelsOpencode: AgentModelApi[];
  modelsAi: AgentModelApi[];
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
