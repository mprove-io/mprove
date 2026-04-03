import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { BaseQuery } from './base.query';

export class SessionState extends SessionApi {}

let sessionState: SessionState = {
  sessionId: undefined,
  type: undefined,
  repoId: undefined,
  branchId: undefined,
  provider: undefined,
  agent: undefined,
  status: undefined,
  initialBranch: undefined,
  envId: undefined,
  initialCommit: undefined,
  createdTs: undefined,
  lastActivityTs: undefined,
  firstMessage: undefined,
  useCodex: false
};

@Injectable({ providedIn: 'root' })
export class SessionQuery extends BaseQuery<SessionState> {
  constructor() {
    super(
      createStore({ name: 'session' }, withProps<SessionState>(sessionState))
    );
  }
}
