import { Inject, Injectable } from '@nestjs/common';
import type { CoreMessage } from 'ai';
import { asc, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages.js';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts.js';
import { TabService } from '../../tab.service';

@Injectable()
export class AgentAiHistoryService {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async loadMessageHistory(item: {
    sessionId: string;
  }): Promise<CoreMessage[]> {
    let { sessionId } = item;

    let messageEnts = await this.db.drizzle.query.ocMessagesTable.findMany({
      where: eq(ocMessagesTable.sessionId, sessionId),
      orderBy: [asc(ocMessagesTable.createdTs)]
    });

    let messageTabs = messageEnts.map(m =>
      this.tabService.ocMessageEntToTab(m)
    );

    let partEnts = await this.db.drizzle.query.ocPartsTable.findMany({
      where: eq(ocPartsTable.sessionId, sessionId),
      orderBy: [asc(ocPartsTable.createdTs)]
    });

    let partTabs = partEnts.map(p => this.tabService.ocPartEntToTab(p));

    let partsByMessageId = new Map<string, typeof partTabs>();

    partTabs.forEach(part => {
      let existing = partsByMessageId.get(part.messageId);
      if (existing) {
        existing.push(part);
      } else {
        partsByMessageId.set(part.messageId, [part]);
      }
    });

    let coreMessages: CoreMessage[] = [];

    messageTabs.forEach(msg => {
      let msgParts = partsByMessageId.get(msg.messageId) || [];
      let textContent = msgParts
        .filter(p => p.type === 'text')
        .map(p => ((p.ocPart as Record<string, unknown>).text as string) || '')
        .join('');

      if (msg.role === 'user') {
        coreMessages.push({ role: 'user', content: textContent });
      } else if (msg.role === 'assistant') {
        coreMessages.push({ role: 'assistant', content: textContent });
      }
    });

    return coreMessages;
  }
}
