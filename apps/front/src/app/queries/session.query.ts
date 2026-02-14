import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { BaseQuery } from './base.query';

export class SessionState extends AgentSessionApi {}

let sessionState: SessionState = {
  sessionId: undefined,
  agent: undefined,
  agentMode: undefined,
  status: undefined,
  createdTs: undefined,
  lastActivityTs: undefined
};

@Injectable({ providedIn: 'root' })
export class SessionQuery extends BaseQuery<SessionState> {
  constructor() {
    super(
      createStore({ name: 'session' }, withProps<SessionState>(sessionState))
    );
  }
}
