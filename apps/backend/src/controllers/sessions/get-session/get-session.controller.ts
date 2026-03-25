import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, asc, eq, gt, max } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { SessionEventApi } from '#common/interfaces/backend/session-event-api';
import { SessionMessageApi } from '#common/interfaces/backend/session-message-api';
import { SessionPartApi } from '#common/interfaces/backend/session-part-api';
import {
  ToBackendGetSessionRequest,
  ToBackendGetSessionResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-get-session';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private tabService: TabService,
    private editorSandboxService: EditorSandboxService,
    private editorStreamService: EditorStreamService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetSession)
  async getSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetSessionRequest = request.body;
    let { sessionId, isFetchFromOpencode } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (session.status === SessionStatusEnum.Deleted) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_NOT_FOUND
      });
    }

    if (session.sandboxId) {
      let sandboxInfo = await this.editorSandboxService.getSandboxInfo({
        sandboxId: session.sandboxId,
        e2bApiKey: project.e2bApiKey
      });

      if (!sandboxInfo || sandboxInfo.state === 'paused') {
        if (!sandboxInfo) {
          session.status = SessionStatusEnum.Archived;
          session.archiveReason = ArchiveReasonEnum.Expire;
        } else if (sandboxInfo.state === 'paused') {
          session.status = SessionStatusEnum.Paused;
        }

        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              sessions: [session]
            }
          });
        });
      }
    }

    if (
      session.status === SessionStatusEnum.Active &&
      session.opencodeSessionId
    ) {
      let isStreamStartedFresh =
        await this.editorStreamService.startEventStream({
          sessionId: sessionId,
          opencodeSessionId: session.opencodeSessionId,
          isSetReload: false
        });

      if (isStreamStartedFresh) {
        await this.editorStreamService.processEventStream({
          sessionId: sessionId
        });
      } else if (isFetchFromOpencode === true) {
        await this.editorStreamService.publishFetchFromOpencodeCommand({
          sessionId: sessionId,
          opencodeSessionId: session.opencodeSessionId
        });
      }
    }

    let ocSession = await this.sessionsService.getOcSessionBySessionId({
      sessionId
    });

    let maxEventIndexRow = await this.db.drizzle
      .select({ maxIndex: max(ocEventsTable.eventIndex) })
      .from(ocEventsTable)
      .where(eq(ocEventsTable.sessionId, sessionId));

    let lastEventIndex = isDefined(maxEventIndexRow[0]?.maxIndex)
      ? maxEventIndexRow[0].maxIndex
      : -1;

    let sessionApi = this.sessionsService.tabToSessionApi({
      session,
      ocSession
    });

    let ocSessionApi = ocSession
      ? this.sessionsService.tabToOcSessionApi({ ocSession })
      : undefined;

    let messages: SessionMessageApi[] = [];
    let parts: SessionPartApi[] = [];

    let messageEnts = await this.db.drizzle.query.ocMessagesTable.findMany({
      where: eq(ocMessagesTable.sessionId, sessionId),
      orderBy: [asc(ocMessagesTable.messageId)]
    });

    messages = messageEnts.map(ent => {
      let tab = this.tabService.ocMessageEntToTab(ent);
      return {
        messageId: tab.messageId,
        sessionId: tab.sessionId,
        role: tab.role,
        ocMessage: tab.ocMessage
      };
    });

    let partEnts = await this.db.drizzle.query.ocPartsTable.findMany({
      where: eq(ocPartsTable.sessionId, sessionId),
      orderBy: [asc(ocPartsTable.partId)]
    });

    parts = partEnts.map(ent => {
      let tab = this.tabService.ocPartEntToTab(ent);
      return {
        partId: tab.partId,
        messageId: tab.messageId,
        sessionId: tab.sessionId,
        ocPart: tab.ocPart
      };
    });

    let lastFetchEventIndex = session.lastFetchEventIndex ?? -1;

    let eventEnts = await this.db.drizzle.query.ocEventsTable.findMany({
      where: and(
        eq(ocEventsTable.sessionId, sessionId),
        gt(ocEventsTable.eventIndex, lastFetchEventIndex)
      ),
      orderBy: [asc(ocEventsTable.eventIndex)]
    });

    let events: SessionEventApi[] = eventEnts.map(ent => {
      let tab = this.tabService.ocEventEntToTab(ent);
      return {
        eventId: tab.eventId,
        eventIndex: tab.eventIndex,
        eventType: tab.type,
        ocEvent: tab.ocEvent
      };
    });

    let result = await this.sessionsService.getBasicSessionsList({
      projectId: session.projectId,
      userId: user.userId,
      currentSessionId: sessionId
    });

    let payload: ToBackendGetSessionResponsePayload = {
      session: sessionApi,
      ocSession: ocSessionApi,
      lastEventIndex: lastEventIndex,
      messages: messages,
      parts: parts,
      events: events,
      sessions: result.sessions,
      hasMoreArchived: result.hasMoreArchived
    };

    return payload;
  }
}
