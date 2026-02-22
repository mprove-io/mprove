import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, desc, eq } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentSessionApi } from '#common/interfaces/backend/agent-session-api';
import {
  ToBackendGetAgentSessionsListRequest,
  ToBackendGetAgentSessionsListResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-sessions-list';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetAgentSessionsListController {
  constructor(
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentSessionsList)
  async getAgentSessionsList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetAgentSessionsListRequest = request.body;
    let { projectId } = reqValid.payload;

    let sessionEnts = await this.db.drizzle.query.sessionsTable.findMany({
      where: and(
        eq(sessionsTable.projectId, projectId),
        eq(sessionsTable.userId, user.userId)
      ),
      orderBy: [desc(sessionsTable.createdTs)]
    });

    let sessions: AgentSessionApi[] = sessionEnts.map(ent => {
      let tab = this.tabService.sessionEntToTab(ent);
      return {
        sessionId: tab.sessionId,
        provider: tab.provider,
        agent: tab.agent,
        model: tab.model,
        lastMessageProviderModel: tab.lastMessageProviderModel,
        lastMessageVariant: tab.lastMessageVariant,
        status: tab.status,
        createdTs: tab.createdTs,
        lastActivityTs: tab.lastActivityTs,
        firstMessage: tab.firstMessage,
        title: tab.ocSession?.title
      };
    });

    let payload: ToBackendGetAgentSessionsListResponsePayload = {
      sessions: sessions
    };

    return payload;
  }
}
