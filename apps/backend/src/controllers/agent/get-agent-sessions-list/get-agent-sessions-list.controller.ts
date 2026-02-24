import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, desc, eq, gte, lt, notInArray } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  SessionEnt,
  sessionsTable
} from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
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
    let { projectId, includeArchived, archivedLimit, archivedLastCreatedTs } =
      reqValid.payload;

    let sessionEnts = await this.db.drizzle.query.sessionsTable.findMany({
      where: and(
        eq(sessionsTable.projectId, projectId),
        eq(sessionsTable.userId, user.userId),
        notInArray(sessionsTable.status, [
          SessionStatusEnum.Deleted,
          SessionStatusEnum.Archived
        ])
      ),
      orderBy: [desc(sessionsTable.createdTs)]
    });

    let allEnts: SessionEnt[] = [...sessionEnts];

    let payload: ToBackendGetAgentSessionsListResponsePayload = {
      sessions: []
    };

    if (includeArchived === true) {
      let limit = archivedLimit ?? 10;

      let baseConditions = [
        eq(sessionsTable.projectId, projectId),
        eq(sessionsTable.userId, user.userId),
        eq(sessionsTable.status, SessionStatusEnum.Archived)
      ];

      if (
        archivedLastCreatedTs !== undefined &&
        archivedLastCreatedTs !== null
      ) {
        // All archived sessions above cursor (previously loaded + newly archived)
        let aboveCursorEnts =
          await this.db.drizzle.query.sessionsTable.findMany({
            where: and(
              ...baseConditions,
              gte(sessionsTable.createdTs, archivedLastCreatedTs)
            ),
            orderBy: [desc(sessionsTable.createdTs)]
          });

        // Next page below cursor
        let belowCursorEnts =
          await this.db.drizzle.query.sessionsTable.findMany({
            where: and(
              ...baseConditions,
              lt(sessionsTable.createdTs, archivedLastCreatedTs)
            ),
            orderBy: [desc(sessionsTable.createdTs)],
            limit: limit + 1
          });

        let hasMore = belowCursorEnts.length > limit;
        if (hasMore) {
          belowCursorEnts = belowCursorEnts.slice(0, limit);
        }

        allEnts = [...allEnts, ...aboveCursorEnts, ...belowCursorEnts];
        payload.hasMoreArchived = hasMore;
      } else {
        // First load
        let archivedEnts = await this.db.drizzle.query.sessionsTable.findMany({
          where: and(...baseConditions),
          orderBy: [desc(sessionsTable.createdTs)],
          limit: limit + 1
        });

        let hasMore = archivedEnts.length > limit;
        if (hasMore) {
          archivedEnts = archivedEnts.slice(0, limit);
        }

        allEnts = [...allEnts, ...archivedEnts];
        payload.hasMoreArchived = hasMore;
      }
    }

    payload.sessions = allEnts.map(ent => {
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

    return payload;
  }
}
