import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CoreMessage, LanguageModel } from 'ai';
import { asc, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages.js';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts.js';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';
import { TabService } from './tab.service';

@Injectable()
export class AiSdkService {
  constructor(
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  getModel(item: {
    provider: string;
    modelId: string;
    apiKey: string;
  }): LanguageModel {
    let { provider, modelId, apiKey } = item;

    if (provider === 'openai') {
      let openai = createOpenAI({ apiKey: apiKey });
      return openai(modelId);
    } else if (provider === 'anthropic') {
      let anthropic = createAnthropic({ apiKey: apiKey });
      return anthropic(modelId);
    }

    throw new ServerError({
      message: ErEnum.BACKEND_AGENT_PROMPT_FAILED
    });
  }

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

    for (let part of partTabs) {
      let existing = partsByMessageId.get(part.messageId);
      if (existing) {
        existing.push(part);
      } else {
        partsByMessageId.set(part.messageId, [part]);
      }
    }

    let coreMessages: CoreMessage[] = [];

    for (let msg of messageTabs) {
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
    }

    return coreMessages;
  }
}
