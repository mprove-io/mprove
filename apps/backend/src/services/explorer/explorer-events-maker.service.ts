import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type {
  AssistantMessage,
  EventMessagePartDelta,
  EventMessagePartUpdated,
  EventMessageUpdated,
  EventSessionError,
  EventSessionStatus,
  TextPart,
  UserMessage
} from '@opencode-ai/sdk/v2';
import { APICallError } from 'ai';
import {
  SESSION_TAB_CREATED_EVENT_TYPE,
  SESSION_TITLE_UPDATED_EVENT_TYPE
} from '#common/constants/top';
import type { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import type { MproveSessionTitleUpdatedEvent } from '#common/zod/backend/session-stream-event';
import type { SessionTabCreatedEvent } from '#common/zod/backend/session-tab-created-event';

@Injectable()
export class ExplorerEventsMakerService {
  makeBusyEvent(item: { sessionId: string }): EventSessionStatus {
    let event: EventSessionStatus = {
      id: crypto.randomUUID(),
      type: 'session.status',
      properties: {
        sessionID: item.sessionId,
        status: { type: 'busy' }
      }
    };

    return event;
  }

  makeIdleEvent(item: { sessionId: string }): EventSessionStatus {
    let event: EventSessionStatus = {
      id: crypto.randomUUID(),
      type: 'session.status',
      properties: {
        sessionID: item.sessionId,
        status: { type: 'idle' }
      }
    };

    return event;
  }

  makeUserMessageEvent(item: {
    messageId: string;
    sessionId: string;
    provider: string;
    modelId: string;
    variant?: string;
    system?: string;
  }): EventMessageUpdated {
    let message: UserMessage = {
      id: item.messageId,
      sessionID: item.sessionId,
      role: 'user',
      time: { created: Date.now() },
      agent: 'explorer',
      model: {
        providerID: item.provider,
        modelID: item.modelId,
        variant: item.variant
      },
      system: item.system
    };

    let event: EventMessageUpdated = {
      id: crypto.randomUUID(),
      type: 'message.updated',
      properties: {
        sessionID: item.sessionId,
        info: message
      }
    };

    return event;
  }

  makeUserPartEvent(item: {
    partId: string;
    messageId: string;
    sessionId: string;
    text: string;
  }): EventMessagePartUpdated {
    let part: TextPart = {
      id: item.partId,
      messageID: item.messageId,
      sessionID: item.sessionId,
      type: 'text',
      text: item.text
    };

    let event: EventMessagePartUpdated = {
      id: crypto.randomUUID(),
      type: 'message.part.updated',
      properties: {
        sessionID: item.sessionId,
        part: part,
        time: Date.now()
      }
    };

    return event;
  }

  makeAssistantMessageEvent(item: {
    messageId: string;
    sessionId: string;
    parentId: string;
    provider: string;
    modelId: string;
    tokens?: {
      total?: number;
      input: number;
      output: number;
      reasoning: number;
      cache: {
        read: number;
        write: number;
      };
    };
    finish?: string;
    errorMessage?: string;
  }): EventMessageUpdated {
    let tokens: AssistantMessage['tokens'] = item.tokens ?? {
      input: 0,
      output: 0,
      reasoning: 0,
      cache: { read: 0, write: 0 }
    };

    let message: AssistantMessage = {
      id: item.messageId,
      sessionID: item.sessionId,
      role: 'assistant',
      time: {
        created: Date.now(),
        ...(item.finish ? { completed: Date.now() } : {})
      },
      parentID: item.parentId,
      modelID: item.modelId,
      providerID: item.provider,
      mode: 'explorer',
      agent: 'explorer',
      path: { cwd: '', root: '' },
      cost: 0,
      tokens: tokens,
      finish: item.finish,
      ...(item.errorMessage
        ? {
            error: {
              name: 'UnknownError' as const,
              data: { message: item.errorMessage }
            }
          }
        : {})
    };

    let event: EventMessageUpdated = {
      id: crypto.randomUUID(),
      type: 'message.updated',
      properties: {
        sessionID: item.sessionId,
        info: message
      }
    };

    return event;
  }

  makeAssistantPartEvent(item: {
    partId: string;
    messageId: string;
    sessionId: string;
  }): EventMessagePartUpdated {
    let part: TextPart = {
      id: item.partId,
      messageID: item.messageId,
      sessionID: item.sessionId,
      type: 'text',
      text: ''
    };

    let event: EventMessagePartUpdated = {
      id: crypto.randomUUID(),
      type: 'message.part.updated',
      properties: {
        sessionID: item.sessionId,
        part: part,
        time: Date.now()
      }
    };

    return event;
  }

  makeTextDeltaEvent(item: {
    messageId: string;
    partId: string;
    sessionId: string;
    delta: string;
  }): EventMessagePartDelta {
    let event: EventMessagePartDelta = {
      id: crypto.randomUUID(),
      type: 'message.part.delta',
      properties: {
        sessionID: item.sessionId,
        messageID: item.messageId,
        partID: item.partId,
        field: 'text',
        delta: item.delta
      }
    };

    return event;
  }

  makeFinalPartEvent(item: {
    partId: string;
    messageId: string;
    sessionId: string;
    text: string;
  }): EventMessagePartUpdated {
    let part: TextPart = {
      id: item.partId,
      messageID: item.messageId,
      sessionID: item.sessionId,
      type: 'text',
      text: item.text
    };

    let event: EventMessagePartUpdated = {
      id: crypto.randomUUID(),
      type: 'message.part.updated',
      properties: {
        sessionID: item.sessionId,
        part: part,
        time: Date.now()
      }
    };

    return event;
  }

  makeAbortedMessageEvent(item: {
    messageId: string;
    sessionId: string;
    parentId: string;
    provider: string;
    modelId: string;
  }): EventMessageUpdated {
    let message: AssistantMessage = {
      id: item.messageId,
      sessionID: item.sessionId,
      role: 'assistant',
      time: { created: Date.now(), completed: Date.now() },
      error: {
        name: 'MessageAbortedError',
        data: { message: 'Message generation was aborted' }
      },
      parentID: item.parentId,
      modelID: item.modelId,
      providerID: item.provider,
      mode: 'explorer',
      agent: 'explorer',
      path: { cwd: '', root: '' },
      cost: 0,
      tokens: {
        input: 0,
        output: 0,
        reasoning: 0,
        cache: { read: 0, write: 0 }
      }
    };

    let event: EventMessageUpdated = {
      id: crypto.randomUUID(),
      type: 'message.updated',
      properties: {
        sessionID: item.sessionId,
        info: message
      }
    };

    return event;
  }

  makeTitleEvent(item: {
    sessionId: string;
    title: string;
  }): MproveSessionTitleUpdatedEvent {
    let event: MproveSessionTitleUpdatedEvent = {
      id: crypto.randomUUID(),
      type: SESSION_TITLE_UPDATED_EVENT_TYPE,
      properties: { sessionID: item.sessionId, title: item.title }
    };

    return event;
  }

  makeErrorEvent(item: {
    sessionId: string;
    error: unknown;
  }): EventSessionError {
    let { error } = item;

    let isApiCallError: boolean = APICallError.isInstance(error);

    if (isApiCallError) {
      let apiCallError: APICallError = error as APICallError;

      let event: EventSessionError = {
        id: crypto.randomUUID(),
        type: 'session.error',
        properties: {
          sessionID: item.sessionId,
          error: {
            name: 'APIError',
            data: {
              message: apiCallError.message,
              statusCode: apiCallError.statusCode,
              isRetryable: apiCallError.isRetryable,
              metadata: { url: apiCallError.url }
            }
          }
        }
      };

      return event;
    }

    let isNativeError: boolean = error instanceof Error;

    let isErrorArray: boolean = Array.isArray(error);

    let isErrorRecord: boolean =
      typeof error === 'object' &&
      error !== null &&
      isNativeError === false &&
      isErrorArray === false;

    if (isErrorRecord) {
      let errorRecord: Record<string, unknown> = error as Record<
        string,
        unknown
      >;

      let nestedError: unknown = errorRecord['error'];

      let isNestedErrorArray: boolean = Array.isArray(nestedError);

      let isNestedErrorRecord: boolean =
        typeof nestedError === 'object' &&
        nestedError !== null &&
        isNestedErrorArray === false;

      let providerError: Record<string, unknown> = isNestedErrorRecord
        ? (nestedError as Record<string, unknown>)
        : errorRecord;

      let providerMessage: unknown = providerError['message'];

      if (typeof providerMessage === 'string') {
        let metadata: Record<string, string> = {};

        let providerType: unknown = providerError['type'];
        if (typeof providerType === 'string') {
          metadata['type'] = providerType;
        }

        let providerCode: unknown = providerError['code'];
        if (typeof providerCode === 'string') {
          metadata['code'] = providerCode;
        }

        let event: EventSessionError = {
          id: crypto.randomUUID(),
          type: 'session.error',
          properties: {
            sessionID: item.sessionId,
            error: {
              name: 'APIError',
              data: {
                message: providerMessage,
                isRetryable: false,
                metadata: metadata
              }
            }
          }
        };

        return event;
      }
    }

    let errorMessage: string =
      isNativeError === true
        ? (error as Error).message
        : 'AI SDK streaming failed';

    let event: EventSessionError = {
      id: crypto.randomUUID(),
      type: 'session.error',
      properties: {
        sessionID: item.sessionId,
        error: {
          name: 'UnknownError',
          data: { message: errorMessage }
        }
      }
    };

    return event;
  }

  makeChartTabEvent(item: {
    tabId: string;
    chartId: string;
    chartType: ChartTypeEnum;
    title: string;
    modelId: string;
  }): SessionTabCreatedEvent {
    let event: SessionTabCreatedEvent = {
      id: crypto.randomUUID(),
      type: SESSION_TAB_CREATED_EVENT_TYPE,
      properties: {
        tabId: item.tabId,
        chartId: item.chartId,
        chartType: item.chartType,
        title: item.title,
        modelId: item.modelId
      }
    };

    return event;
  }
}
