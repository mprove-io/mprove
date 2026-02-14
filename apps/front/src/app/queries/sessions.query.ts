import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import { BaseQuery } from './base.query';

export class SessionsState {
  sessions: AgentSessionApi[];
}

let sessionsState: SessionsState = {
  sessions: []
};

@Injectable({ providedIn: 'root' })
export class SessionsQuery extends BaseQuery<SessionsState> {
  sessions$ = this.store.pipe(select(state => state.sessions));

  constructor() {
    super(
      createStore({ name: 'sessions' }, withProps<SessionsState>(sessionsState))
    );
  }
}
