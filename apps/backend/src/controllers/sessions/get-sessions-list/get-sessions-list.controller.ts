import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, desc, eq, gte, inArray, lt, notInArray } from 'drizzle-orm';
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
import { MembersService } from '#backend/services/db/members.service.js';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetSessionsListRequest,
  ToBackendGetSessionsListResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-get-sessions-list';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSessionsListController {
  constructor(
    private projectsService: ProjectsService,
    private sessionsService: SessionsService,
    private editorSandboxService: EditorSandboxService,
    private membersService: MembersService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetSessionsList)
  async getSessionsList(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetSessionsListRequest = request.body;
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

    await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    if (project.e2bApiKey) {
      let editorSessions = await this.db.drizzle.query.sessionsTable
        .findMany({
          where: and(
            eq(sessionsTable.projectId, projectId),
            eq(sessionsTable.userId, user.userId),
            eq(sessionsTable.type, SessionTypeEnum.Editor),
            inArray(sessionsTable.status, [
              SessionStatusEnum.Active,
              SessionStatusEnum.Paused
            ])
          )
        })
        .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

      await this.editorSandboxService.syncEditorSessionsStatus({
        editorSessions: editorSessions,
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

    let payload: ToBackendGetSessionsListResponsePayload = {
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
    } else {
      let archivedExists = await this.db.drizzle.query.sessionsTable.findFirst({
        where: and(
          eq(sessionsTable.projectId, projectId),
          eq(sessionsTable.userId, user.userId),
          eq(sessionsTable.status, SessionStatusEnum.Archived)
        ),
        columns: { sessionId: true }
      });

      payload.hasMoreArchived = archivedExists !== undefined;
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

    payload.sessions = await this.sessionsService.entsToSessionApis({
      allEnts
    });

    return payload;
  }
}
