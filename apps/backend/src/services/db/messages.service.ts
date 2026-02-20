import { Injectable } from '@nestjs/common';
import type { Message } from '@opencode-ai/sdk/v2';
import type { MessageTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class MessagesService {
  makeMessage(item: {
    messageId: string;
    sessionId: string;
    role: string;
    ocMessage: Message;
  }): MessageTab {
    let now = Date.now();

    let messageTab: MessageTab = {
      messageId: item.messageId,
      sessionId: item.sessionId,
      role: item.role,
      ocMessage: item.ocMessage,
      createdTs: now,
      serverTs: undefined,
      keyTag: undefined
    };

    return messageTab;
  }
}
