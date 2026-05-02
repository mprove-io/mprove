import { Injectable } from '@angular/core';
import type { Event } from '@opencode-ai/sdk/v2';
import { SESSION_TAB_CREATED_EVENT_TYPE } from '#common/constants/top';
import type { SessionMessageApi } from '#common/zod/backend/session-message-api';
import type { SessionPartApi } from '#common/zod/backend/session-part-api';
import type { SessionTabCreatedEventProperties } from '#common/zod/backend/session-tab-created-event';
import { binarySearch } from '../functions/binary-search';
import { ExplorerTabsQuery } from '../queries/explorer-tabs.query';
import { SessionQuery } from '../queries/session.query';
import {
  SessionBundleQuery,
  SessionBundleState
} from '../queries/session-bundle.query';

@Injectable({ providedIn: 'root' })
export class SessionEventsService {
  private seenFirstDeltaPartIds: Set<string> = new Set();

  constructor(
    private sessionBundleQuery: SessionBundleQuery,
    private sessionQuery: SessionQuery,
    private explorerTabsQuery: ExplorerTabsQuery
  ) {}

  applyEvent(event: Event) {
    if (this.applySpecialEvent(event)) {
      return;
    }
    let state = this.sessionBundleQuery.getValue();
    let newState = this.reduceEvent(state, event);
    if (newState !== state) {
      this.sessionBundleQuery.updatePart(newState);
    }
  }

  applyEvents(events: Event[]) {
    let state = this.sessionBundleQuery.getValue();
    events.forEach(event => {
      if (this.applySpecialEvent(event)) {
        return;
      }
      if (event.type === 'message.part.delta') {
        let props = event.properties;
        let messageParts = state.parts[props.messageID];

        let isFirstDelta = false;

        if (messageParts) {
          let result = binarySearch(messageParts, props.partID, p => p.partId);
          if (result.found) {
            let partData = messageParts[result.index].ocPart as Record<
              string,
              unknown
            >;
            let existing = partData[props.field] as string | undefined;
            isFirstDelta = !existing;
          }
        }

        if (isFirstDelta) {
          this.seenFirstDeltaPartIds.add(props.partID);
          state = this.reduceEvent(state, event);
        } else if (this.seenFirstDeltaPartIds.has(props.partID)) {
          state = this.reduceEvent(state, event);
        } else {
          // else: skip — part has content from stored state, no first delta seen
        }
      } else {
        state = this.reduceEvent(state, event);
      }
    });
    this.sessionBundleQuery.updatePart(state);
  }

  resetDeltaGuard() {
    this.seenFirstDeltaPartIds = new Set();
  }

  resetAll() {
    this.seenFirstDeltaPartIds = new Set();
    this.sessionBundleQuery.reset();
    this.explorerTabsQuery.resetTabs();
  }

  private applySpecialEvent(event: Event): boolean {
    let raw = event as unknown as { type?: string; properties?: unknown };

    if (raw.type !== SESSION_TAB_CREATED_EVENT_TYPE) {
      return false;
    }

    let props = raw.properties as SessionTabCreatedEventProperties;

    let mproveSessionId = this.sessionQuery.getValue()?.sessionId;

    if (!mproveSessionId) return true;

    let state = this.explorerTabsQuery.getValue();

    if (state.sessionId !== mproveSessionId) {
      let session = this.sessionQuery.getValue();

      this.explorerTabsQuery.setSession({
        sessionId: mproveSessionId,
        closedTabIds: session?.closedExplorerTabIds ?? []
      });
    }

    let isOpened = this.explorerTabsQuery.appendTab({
      tab: {
        id: props.tabId,
        label: props.title,
        kind: 'chart',
        chartId: props.chartId,
        modelId: props.modelId,
        closable: false
      }
    });

    if (isOpened) {
      this.explorerTabsQuery.setActive({ tabId: props.tabId });
    }

    return true;
  }

  private reduceEvent(
    state: SessionBundleState,
    event: Event
  ): SessionBundleState {
    switch (event.type) {
      case 'message.updated': {
        let raw = event.properties.info;
        let messageId: string = raw.id;
        let role: string = raw.role;
        let mproveSessionId = this.sessionQuery.getValue()?.sessionId || '';

        let messages = state.messages ? [...state.messages] : [];

        let result = binarySearch(messages, messageId, m => m.messageId);

        let msgApi: SessionMessageApi = {
          messageId: messageId,
          sessionId: mproveSessionId,
          role: role,
          ocMessage: raw
        };

        if (result.found) {
          messages[result.index] = msgApi;
        } else {
          messages.splice(result.index, 0, msgApi);
        }

        return { ...state, messages };
      }

      case 'message.removed': {
        let props = event.properties;
        let messages = state.messages ? [...state.messages] : [];

        let result = binarySearch(messages, props.messageID, m => m.messageId);

        if (result.found) {
          messages.splice(result.index, 1);
        }

        let parts = { ...state.parts };
        delete parts[props.messageID];

        return { ...state, messages, parts };
      }

      case 'message.part.updated': {
        let part = event.properties.part;
        let allParts = { ...state.parts };

        let messageId = part.messageID;
        let partId = part.id;
        let messageParts = allParts[messageId] ? [...allParts[messageId]] : [];

        let result = binarySearch(messageParts, partId, p => p.partId);

        let mproveSessionId2 = this.sessionQuery.getValue()?.sessionId || '';

        let partApi: SessionPartApi = {
          partId: partId,
          messageId: messageId,
          sessionId: mproveSessionId2,
          ocPart: part
        };

        if (result.found) {
          messageParts[result.index] = partApi;
        } else {
          messageParts.splice(result.index, 0, partApi);
        }

        allParts[messageId] = messageParts;
        return { ...state, parts: allParts };
      }

      case 'message.part.removed': {
        let props = event.properties;
        let allParts = { ...state.parts };
        let messageParts = allParts[props.messageID];
        if (!messageParts) return state;

        messageParts = [...messageParts];
        let result = binarySearch(messageParts, props.partID, p => p.partId);

        if (!result.found) return state;

        messageParts.splice(result.index, 1);
        if (messageParts.length === 0) {
          delete allParts[props.messageID];
        } else {
          allParts[props.messageID] = messageParts;
        }
        return { ...state, parts: allParts };
      }

      case 'message.part.delta': {
        let props = event.properties;
        let messageParts = state.parts[props.messageID];
        if (!messageParts) return state;

        let result = binarySearch(messageParts, props.partID, p => p.partId);
        if (!result.found) return state;

        let updatedParts = [...messageParts];
        let existingPart = { ...updatedParts[result.index] };
        let partData: Record<string, unknown> = { ...existingPart.ocPart };
        let existing = partData[props.field] as string | undefined;
        partData[props.field] = (existing ?? '') + props.delta;
        existingPart.ocPart = partData as SessionPartApi['ocPart'];
        updatedParts[result.index] = existingPart;

        let allParts = { ...state.parts };
        allParts[props.messageID] = updatedParts;
        return { ...state, parts: allParts };
      }

      case 'session.status': {
        let status = event.properties.status;
        let updates: Partial<SessionBundleState> = {
          ocSessionStatus: status
        };
        if (status.type === 'idle' && state.lastSessionError) {
          updates.isLastErrorRecovered = true;
        }
        return { ...state, ...updates };
      }

      case 'session.error': {
        let error = event.properties.error;
        return {
          ...state,
          lastSessionError: error
            ? (error as Record<string, unknown>)
            : undefined,
          isLastErrorRecovered: false
        };
      }

      case 'session.updated': {
        let info = event.properties.info;
        return { ...state, sessionTitle: info?.title };
      }

      case 'todo.updated': {
        let todos = event.properties.todos ?? [];
        return { ...state, todos };
      }

      case 'permission.asked': {
        let permission = event.properties;
        let permissions = state.permissions ? [...state.permissions] : [];

        let result = binarySearch(permissions, permission.id, p => p.id);

        if (result.found) {
          permissions[result.index] = permission;
        } else {
          permissions.splice(result.index, 0, permission);
        }

        return { ...state, permissions };
      }

      case 'permission.replied': {
        let props = event.properties;
        let permissions = state.permissions ? [...state.permissions] : [];

        let result = binarySearch(permissions, props.requestID, p => p.id);

        if (!result.found) return state;

        permissions.splice(result.index, 1);
        return { ...state, permissions };
      }

      case 'question.asked': {
        let question = event.properties;
        let questions = state.questions ? [...state.questions] : [];

        let result = binarySearch(questions, question.id, q => q.id);

        if (result.found) {
          questions[result.index] = question;
        } else {
          questions.splice(result.index, 0, question);
        }

        return { ...state, questions };
      }

      case 'question.replied':
      case 'question.rejected': {
        let props = event.properties;
        let questions = state.questions ? [...state.questions] : [];

        let result = binarySearch(questions, props.requestID, q => q.id);

        if (!result.found) return state;

        questions.splice(result.index, 1);
        return { ...state, questions };
      }

      default:
        return state;
    }
  }
}
