import { Injectable } from '@nestjs/common';
import type { Event } from '@opencode-ai/sdk/v2';
import { APICallError } from 'ai';
import { SESSION_TAB_CREATED_EVENT_TYPE } from '#common/constants/top';
import type { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';

@Injectable()
export class ExplorerEventsMakerService {
  makeBusyEvent(): Event {
    return {
      type: 'session.status',
      properties: { status: { type: 'busy' } }
    } as Event;
  }

  makeIdleEvent(): Event {
    return {
      type: 'session.status',
      properties: { status: { type: 'idle' } }
    } as Event;
  }

  makeUserMessageEvent(item: {
    messageId: string;
    sessionId: string;
    provider: string;
    modelId: string;
    system?: string;
  }): Event {
    return {
      type: 'message.updated',
      properties: {
        info: {
          id: item.messageId,
          sessionID: item.sessionId,
          role: 'user',
          model: { providerID: item.provider, modelID: item.modelId },
          system: item.system
        }
      }
    } as Event;
  }

  makeUserPartEvent(item: {
    partId: string;
    messageId: string;
    sessionId: string;
    text: string;
  }): Event {
    return {
      type: 'message.part.updated',
      properties: {
        part: {
          id: item.partId,
          messageID: item.messageId,
          sessionID: item.sessionId,
          type: 'text',
          text: item.text
        }
      }
    } as Event;
  }

  makeAssistantMessageEvent(item: {
    messageId: string;
    sessionId: string;
    provider?: string;
    modelId?: string;
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
  }): Event {
    return {
      type: 'message.updated',
      properties: {
        info: {
          id: item.messageId,
          sessionID: item.sessionId,
          role: 'assistant',
          providerID: item.provider,
          modelID: item.modelId,
          tokens: item.tokens,
          finish: item.finish
        }
      }
    } as Event;
  }

  makeAssistantPartEvent(item: {
    partId: string;
    messageId: string;
    sessionId: string;
  }): Event {
    return {
      type: 'message.part.updated',
      properties: {
        part: {
          id: item.partId,
          messageID: item.messageId,
          sessionID: item.sessionId,
          type: 'text',
          text: ''
        }
      }
    } as Event;
  }

  makeTextDeltaEvent(item: {
    messageId: string;
    partId: string;
    delta: string;
  }): Event {
    return {
      type: 'message.part.delta',
      properties: {
        messageID: item.messageId,
        partID: item.partId,
        field: 'text',
        delta: item.delta
      }
    } as Event;
  }

  makeFinalPartEvent(item: {
    partId: string;
    messageId: string;
    sessionId: string;
    text: string;
  }): Event {
    return {
      type: 'message.part.updated',
      properties: {
        part: {
          id: item.partId,
          messageID: item.messageId,
          sessionID: item.sessionId,
          type: 'text',
          text: item.text
        }
      }
    } as Event;
  }

  makeAbortedMessageEvent(item: {
    messageId: string;
    sessionId: string;
  }): Event {
    return {
      type: 'message.updated',
      properties: {
        info: {
          id: item.messageId,
          sessionID: item.sessionId,
          role: 'assistant',
          error: { name: 'MessageAbortedError' }
        }
      }
    } as Event;
  }

  makeTitleEvent(item: { title: string }): Event {
    return {
      type: 'session.updated',
      properties: { info: { title: item.title } }
    } as Event;
  }

  makeErrorEvent(item: { error: unknown }): Event {
    let { error } = item;

    let isApiCallError: boolean = APICallError.isInstance(error);

    if (isApiCallError) {
      let apiCallError: APICallError = error as APICallError;

      return {
        type: 'session.error',
        properties: {
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
      } as Event;
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

        return {
          type: 'session.error',
          properties: {
            error: {
              name: 'APIError',
              data: {
                message: providerMessage,
                isRetryable: false,
                metadata: metadata
              }
            }
          }
        } as Event;
      }
    }

    let errorMessage: string =
      isNativeError === true
        ? (error as Error).message
        : 'AI SDK streaming failed';

    return {
      type: 'session.error',
      properties: {
        error: {
          name: 'UnknownError',
          data: { message: errorMessage }
        }
      }
    } as Event;
  }

  makeChartTabEvent(item: {
    tabId: string;
    chartId: string;
    chartType: ChartTypeEnum;
    title: string;
    modelId: string;
  }): Event {
    return {
      type: SESSION_TAB_CREATED_EVENT_TYPE,
      properties: {
        tabId: item.tabId,
        chartId: item.chartId,
        chartType: item.chartType,
        title: item.title,
        modelId: item.modelId
      }
    } as unknown as Event;
  }
}
