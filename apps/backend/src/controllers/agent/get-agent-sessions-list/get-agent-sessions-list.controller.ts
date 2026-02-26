import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, desc, eq, gte, inArray, lt, notInArray } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import {
  SessionEnt,
  sessionsTable
} from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
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
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private agentService: AgentService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentSessionsList)
  async getAgentSessionsList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetAgentSessionsListRequest = request.body;
    let {
      projectId,
      currentSessionId,
      includeArchived,
      archivedLimit,
      archivedLastCreatedTs
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    if (project.e2bApiKey) {
      await this.agentService.syncProjectSandboxStatuses({
        projectId: projectId,
        e2bApiKey: project.e2bApiKey
      });
    }

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

    if (currentSessionId) {
      let alreadyIncluded = allEnts.some(e => e.sessionId === currentSessionId);
      if (!alreadyIncluded) {
        let currentSessionEnt =
          await this.db.drizzle.query.sessionsTable.findFirst({
            where: and(
              eq(sessionsTable.sessionId, currentSessionId),
              eq(sessionsTable.projectId, projectId),
              eq(sessionsTable.userId, user.userId)
            )
          });
        if (currentSessionEnt) {
          allEnts = [...allEnts, currentSessionEnt];
        }
      }
    }

    let sessionIds = allEnts.map(e => e.sessionId);

    let ocSessionEnts =
      sessionIds.length > 0
        ? await this.db.drizzle.query.ocSessionsTable.findMany({
            where: inArray(ocSessionsTable.sessionId, sessionIds)
          })
        : [];

    let ocSessionMap = new Map(
      ocSessionEnts.map(e => [
        e.sessionId,
        this.tabService.ocSessionEntToTab(e)
      ])
    );

    payload.sessions = allEnts.map(ent => {
      let session = this.tabService.sessionEntToTab(ent);
      let ocSession = ocSessionMap.get(session.sessionId);
      return this.sessionsService.tabToSessionApi({ session, ocSession });
    });

    return payload;
  }
}
