import { Injectable } from '@nestjs/common';
import type { Part } from '@opencode-ai/sdk/v2';
import type { PartTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class PartsService {
  makePart(item: {
    partId: string;
    messageId: string;
    sessionId: string;
    ocPart: Part;
  }): PartTab {
    let now = Date.now();

    let partTab: PartTab = {
      partId: item.partId,
      messageId: item.messageId,
      sessionId: item.sessionId,
      type: item.ocPart.type,
      ocPart: item.ocPart,
      createdTs: now,
      serverTs: undefined,
      keyTag: undefined
    };

    return partTab;
  }
}
