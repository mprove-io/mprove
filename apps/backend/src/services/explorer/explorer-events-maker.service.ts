import { Injectable } from '@nestjs/common';
import type { Event } from '@opencode-ai/sdk/v2';
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
  }): Event {
    return {
      type: 'message.updated',
      properties: {
        info: {
          id: item.messageId,
          sessionID: item.sessionId,
          role: 'user',
          model: { providerID: item.provider, modelID: item.modelId }
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

  makeErrorEvent(item: { errorMessage: string }): Event {
    return {
      type: 'session.error',
      properties: {
        error: { message: item.errorMessage }
      }
    } as unknown as Event;
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
