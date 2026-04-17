import { Injectable } from '@angular/core';
import { createStore, select, withProps } from '@ngneat/elf';
import type {
  PermissionRequest,
  QuestionRequest,
  SessionStatus,
  Todo
} from '@opencode-ai/sdk/v2';
import type { SessionMessageApi } from '#common/zod/backend/session-message-api';
import type { SessionPartApi } from '#common/zod/backend/session-part-api';
import { BaseQuery } from './base.query';

export class SessionBundleState {
  messages: SessionMessageApi[];
  parts: { [messageId: string]: SessionPartApi[] };
  permissions: PermissionRequest[];
  questions: QuestionRequest[];
  ocSessionStatus: SessionStatus;
  sessionTitle?: string;
  todos: Todo[];
  lastSessionError?: Record<string, unknown>;
  isLastErrorRecovered?: boolean;
  lastEventIndex: number;
}

let sessionBundleState: SessionBundleState = {
  messages: [],
  parts: {},
  permissions: [],
  questions: [],
  ocSessionStatus: undefined,
  sessionTitle: undefined,
  todos: [],
  lastSessionError: undefined,
  isLastErrorRecovered: undefined,
  lastEventIndex: -1
};

@Injectable({ providedIn: 'root' })
export class SessionBundleQuery extends BaseQuery<SessionBundleState> {
  messages$ = this.store.pipe(select(state => state.messages));
  parts$ = this.store.pipe(select(state => state.parts));
  permissions$ = this.store.pipe(select(state => state.permissions));
  questions$ = this.store.pipe(select(state => state.questions));
  ocSessionStatus$ = this.store.pipe(select(state => state.ocSessionStatus));
  todos$ = this.store.pipe(select(state => state.todos));
  lastSessionError$ = this.store.pipe(select(state => state.lastSessionError));
  isLastErrorRecovered$ = this.store.pipe(
    select(state => state.isLastErrorRecovered)
  );

  constructor() {
    super(
      createStore(
        { name: 'sessionBundle' },
        withProps<SessionBundleState>(sessionBundleState)
      )
    );
  }
}
