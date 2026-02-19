import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import { BaseQuery } from './base.query';

export class AgentModelsState {
  models: AgentModelApi[];
}

let agentModelsState: AgentModelsState = {
  models: []
};

@Injectable({ providedIn: 'root' })
export class AgentModelsQuery extends BaseQuery<AgentModelsState> {
  models$ = this.store.pipe(select(state => state.models));

  constructor() {
    super(
      createStore(
        { name: 'agentModels' },
        withProps<AgentModelsState>(agentModelsState)
      )
    );
  }
}
