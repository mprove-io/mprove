import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, asc, eq, gt, max } from 'drizzle-orm';
import {
  type ToBackendGetSessionRequestDto,
  ToBackendGetSessionResponseDto
} from '#backend/controllers/sessions/get-session/get-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { ocEventsTable } from '#backend/drizzle/postgres/tables/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/tables/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/tables/oc-parts';
import { ocSessionsTable } from '#backend/drizzle/postgres/tables/oc-sessions';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { tabToOcSessionApi } from '#backend/functions/db/oc-sessions/tab-to-oc-session-api/tab-to-oc-session-api';
import { getBasicSessionsList } from '#backend/functions/db/sessions/get-basic-sessions-list/get-basic-sessions-list';
import { tabToSessionApi } from '#backend/functions/db/sessions/tab-to-session-api/tab-to-session-api';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { StartEventStreamError } from '#common/types/backend/function-errors/start-event-stream-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetSessionOutput } from '#common/types/backend/routes/sessions/get-session/get-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSessionController {
  constructor(
    private editorSandboxService: EditorSandboxService,
    private editorStreamService: EditorStreamService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetSession' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetSession',
    description: 'Get a session with its messages, parts, and events'
  })
  @ApiOkResponse({
    type: ToBackendGetSessionResponseDto
  })
  async getSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetSessionRequestDto
  ): Promise<BackendResultForOperation<'getSession'>> {
    return Result.pipe(
      Result.succeed({
        sessionId: body.input.sessionId,
        isFetchFromOpencode: body.input.isFetchFromOpencode,
        userId: user.userId
      }),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.session.projectId)
        })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.userId
          ? Result.fail({ code: 'BACKEND_UNAUTHORIZED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.status === 'Deleted'
          ? Result.fail({ code: 'BACKEND_SESSION_NOT_FOUND' })
          : Result.succeed()
      ),
      Result.andThrough(async v => {
        if (v.session.sandboxId && v.session.status !== 'Archived') {
          let sandboxInfo: Awaited<
            ReturnType<EditorSandboxService['getSandboxInfo']>
          > = await this.editorSandboxService.getSandboxInfo({
            sandboxId: v.session.sandboxId,
            e2bApiKey: v.project.e2bApiKey
          });

          if (!sandboxInfo || sandboxInfo.state === 'paused') {
            if (!sandboxInfo) {
              v.session.status = 'Archived';

              v.session.archiveReason = 'Expire';
            } else if (sandboxInfo.state === 'paused') {
              v.session.status = 'Paused';
            }

            return dbErrorToResult({
              action: async () => {
                await this.db.writeUnwrap({
                  insertOrUpdate: { sessions: [v.session] }
                });
              }
            });
          }
        }

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (v.session.status === 'Active' && v.session.opencodeSessionId) {
          let streamResult: Result.Result<boolean, StartEventStreamError> =
            await this.editorStreamService.startEventStream({
              sessionId: v.sessionId,
              opencodeSessionId: v.session.opencodeSessionId,
              isSetReload: false
            });

          if (Result.isFailure(streamResult)) {
            return streamResult;
          }

          if (streamResult.value) {
            await this.editorStreamService.processEventStream({
              sessionId: v.sessionId
            });
          } else if (v.isFetchFromOpencode === true) {
            await this.editorStreamService.publishFetchFromOpencodeCommand({
              sessionId: v.sessionId,
              opencodeSessionId: v.session.opencodeSessionId
            });
          }
        }

        return Result.succeed();
      }),
      Result.bind('ocSession', v =>
        this.db.ocSessions.findFirst({
          where: eq(ocSessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.bind('lastEventIndex', v =>
        this.db.drizzle
          .select({ maxIndex: max(ocEventsTable.eventIndex) })
          .from(ocEventsTable)
          .where(eq(ocEventsTable.sessionId, v.sessionId))
          .then(rows =>
            Result.succeed(isDefined(rows[0]?.maxIndex) ? rows[0].maxIndex : -1)
          )
      ),
      Result.bind('sessionApi', v =>
        Result.succeed(
          tabToSessionApi({
            session: v.session,
            ocSession: v.ocSession
          })
        )
      ),
      Result.bind('ocSessionApi', v =>
        Result.succeed(
          v.ocSession
            ? tabToOcSessionApi({
                ocSession: v.ocSession
              })
            : undefined
        )
      ),
      Result.bind('messages', v =>
        this.db.ocMessages.findMany({
          where: eq(ocMessagesTable.sessionId, v.sessionId),
          orderBy: [asc(ocMessagesTable.messageId)]
        })
      ),
      Result.bind('parts', v =>
        this.db.ocParts.findMany({
          where: eq(ocPartsTable.sessionId, v.sessionId),
          orderBy: [asc(ocPartsTable.partId)]
        })
      ),
      Result.bind('events', v =>
        this.db.ocEvents.findMany({
          where: and(
            eq(ocEventsTable.sessionId, v.sessionId),
            gt(ocEventsTable.eventIndex, v.session.lastFetchEventIndex ?? -1)
          ),
          orderBy: [asc(ocEventsTable.eventIndex)]
        })
      ),
      Result.bind('sessionList', v =>
        getBasicSessionsList({
          projectId: v.session.projectId,
          userId: v.userId,
          currentSessionId: v.sessionId,
          db: this.db
        })
      ),
      Result.map(
        (v): ToBackendGetSessionOutput => ({
          session: v.sessionApi,
          ocSession: v.ocSessionApi,
          lastEventIndex: v.lastEventIndex,
          messages: v.messages.map(message => ({
            messageId: message.messageId,
            sessionId: message.sessionId,
            role: message.role,
            ocMessage: message.ocMessage
          })),
          parts: v.parts.map(part => ({
            partId: part.partId,
            messageId: part.messageId,
            sessionId: part.sessionId,
            ocPart: part.ocPart
          })),
          events: v.events.map(event => ({
            eventId: event.eventId,
            eventIndex: event.eventIndex,
            eventType: event.type,
            ocEvent: event.ocEvent
          })),
          sessions: v.sessionList.sessions,
          hasMoreArchived: v.sessionList.hasMoreArchived
        })
      )
    );
  }
}
