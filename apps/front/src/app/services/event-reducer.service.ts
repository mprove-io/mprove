import { Injectable } from '@angular/core';
import type { Event } from '#common/interfaces/backend/agent-event-api';
import { AgentMessageApi } from '#common/interfaces/backend/agent-message-api';
import { AgentPartApi } from '#common/interfaces/backend/agent-part-api';
import { binarySearch } from '../functions/binary-search';
import {
  SessionDataQuery,
  SessionDataState
} from '../queries/session-data.query';

@Injectable({ providedIn: 'root' })
export class EventReducerService {
  constructor(private sessionDataQuery: SessionDataQuery) {}

  applyEvent(event: Event) {
    let state = this.sessionDataQuery.getValue();
    let newState = this.reduceEvent(state, event);
    if (newState !== state) {
      this.sessionDataQuery.updatePart(newState);
    }
  }

  applyEvents(events: Event[]) {
    let state = this.sessionDataQuery.getValue();
    for (let event of events) {
      state = this.reduceEvent(state, event);
    }
    this.sessionDataQuery.updatePart(state);
  }

  resetAll() {
    this.sessionDataQuery.reset();
  }

  private reduceEvent(state: SessionDataState, event: Event): SessionDataState {
    switch (event.type) {
      case 'message.updated': {
        let raw = event.properties.info;
        let messageId: string = raw.id;
        let sessionId: string = raw.sessionID;
        let role: string = raw.role;

        let messages = state.messages ? [...state.messages] : [];

        let result = binarySearch(messages, messageId, m => m.messageId);

        let msgApi: AgentMessageApi = {
          messageId,
          sessionId,
          role,
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

        let partApi: AgentPartApi = {
          partId: partId,
          messageId: messageId,
          sessionId: part.sessionID,
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
        existingPart.ocPart = partData as AgentPartApi['ocPart'];
        updatedParts[result.index] = existingPart;

        let allParts = { ...state.parts };
        allParts[props.messageID] = updatedParts;
        return { ...state, parts: allParts };
      }

      case 'session.status': {
        return { ...state, sdkSessionStatus: event.properties.status };
      }

      case 'session.updated': {
        let info = event.properties.info;
        return { ...state, sessionTitle: info?.title };
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
