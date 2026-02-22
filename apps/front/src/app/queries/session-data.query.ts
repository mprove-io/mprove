import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type {
  PermissionRequest,
  QuestionRequest,
  SessionStatus
} from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { BaseQuery } from './base.query';

export class SessionDataState {
  messages: AgentMessageApi[];
  parts: { [messageId: string]: AgentPartApi[] };
  permissions: PermissionRequest[];
  questions: QuestionRequest[];
  sdkSessionStatus: SessionStatus;
  sessionTitle?: string;
}

let sessionDataState: SessionDataState = {
  messages: [],
  parts: {},
  permissions: [],
  questions: [],
  sdkSessionStatus: undefined,
  sessionTitle: undefined
};

@Injectable({ providedIn: 'root' })
export class SessionDataQuery extends BaseQuery<SessionDataState> {
  messages$ = this.store.pipe(select(state => state.messages));
  parts$ = this.store.pipe(select(state => state.parts));
  permissions$ = this.store.pipe(select(state => state.permissions));
  questions$ = this.store.pipe(select(state => state.questions));
  sdkSessionStatus$ = this.store.pipe(select(state => state.sdkSessionStatus));

  constructor() {
    super(
      createStore(
        { name: 'sessionData' },
        withProps<SessionDataState>(sessionDataState)
      )
    );
  }
}
