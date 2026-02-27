import { Injectable } from '@angular/core';
import { createStore, withProps } from '@ngneat/elf';
import { SessionApi } from '#common/interfaces/backend/session-api';
import { BaseQuery } from './base.query';

export class SessionState extends SessionApi {}

let sessionState: SessionState = {
  sessionId: undefined,
  repoId: undefined,
  branchId: undefined,
  provider: undefined,
  agent: undefined,
  status: undefined,
  initialBranch: undefined,
  initialCommit: undefined,
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
