import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type {
  PermissionRequest,
  QuestionRequest,
  SessionStatus,
  Todo
} from '@opencode-ai/sdk/v2';
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
  todos: Todo[];
}

let sessionDataState: SessionDataState = {
  messages: [],
  parts: {},
  permissions: [],
  questions: [],
  sdkSessionStatus: undefined,
  sessionTitle: undefined,
  todos: []
};

@Injectable({ providedIn: 'root' })
export class SessionDataQuery extends BaseQuery<SessionDataState> {
  messages$ = this.store.pipe(select(state => state.messages));
  parts$ = this.store.pipe(select(state => state.parts));
  permissions$ = this.store.pipe(select(state => state.permissions));
  questions$ = this.store.pipe(select(state => state.questions));
  sdkSessionStatus$ = this.store.pipe(select(state => state.sdkSessionStatus));
  todos$ = this.store.pipe(select(state => state.todos));

  constructor() {
    super(
      createStore(
        { name: 'sessionData' },
        withProps<SessionDataState>(sessionDataState)
      )
    );
  }
}
