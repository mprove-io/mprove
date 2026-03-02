import { Injectable } from '@nestjs/common';
import type { Message } from '@opencode-ai/sdk/v2';
import type { OcMessageTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class OcMessagesService {
  makeOcMessage(item: {
    messageId: string;
    sessionId: string;
    role: string;
    ocMessage: Message;
  }): OcMessageTab {
    let now = Date.now();

    let messageTab: OcMessageTab = {
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
