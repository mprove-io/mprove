import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, asc, eq, gt, max } from 'drizzle-orm';
import {
  ToBackendGetSessionRequestDto,
  ToBackendGetSessionResponseDto
} from '#backend/controllers/sessions/get-session/get-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcEventTab,
  OcMessageTab,
  OcPartTab,
  OcSessionTab,
  ProjectTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { GetBasicSessionsListOutput } from '#backend/services/db/sessions/sessions.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetBasicSessionsListError } from '#common/types/backend/function-errors/get-basic-sessions-list-error';
import type { GetOcSessionBySessionIdError } from '#common/types/backend/function-errors/get-oc-session-by-session-id-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { OcEventEntToTabError } from '#common/types/backend/function-errors/oc-event-ent-to-tab-error';
import type { OcMessageEntToTabError } from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
import type { OcPartEntToTabError } from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';
import type { StartEventStreamError } from '#common/types/backend/function-errors/start-event-stream-error';
import type { OcSessionApi } from '#common/types/backend/parts/session/oc-session-api';
import type { SessionApi } from '#common/types/backend/parts/session/session-api';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetSessionOutput } from '#common/types/backend/routes/sessions/get-session/get-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
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
      Result.bind(
        'session',
        (v): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> =>
          this.sessionsService.getSessionByIdCheckExistsResult({
            sessionId: v.sessionId
          })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExistsResult({
            projectId: v.session.projectId
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
                await this.db.drizzle.transaction(async tx => {
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: { sessions: [v.session] }
                  });
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
            await this.editorStreamService.startEventStreamResult({
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
      Result.bind(
        'ocSession',
        (v): Result.ResultAsync<OcSessionTab, GetOcSessionBySessionIdError> =>
          this.sessionsService.getOcSessionBySessionIdResult({
            sessionId: v.sessionId
          })
      ),
      Result.bind(
        'lastEventIndex',
        (v): Result.ResultAsync<number, never> =>
          this.db.drizzle
            .select({ maxIndex: max(ocEventsTable.eventIndex) })
            .from(ocEventsTable)
            .where(eq(ocEventsTable.sessionId, v.sessionId))
            .then(rows =>
              Result.succeed(
                isDefined(rows[0]?.maxIndex) ? rows[0].maxIndex : -1
              )
            )
      ),
      Result.bind(
        'sessionApi',
        (v): Result.Result<SessionApi, never> =>
          Result.succeed(
            this.sessionsService.tabToSessionApi({
              session: v.session,
              ocSession: v.ocSession
            })
          )
      ),
      Result.bind(
        'ocSessionApi',
        (v): Result.Result<OcSessionApi, never> =>
          Result.succeed(
            v.ocSession
              ? this.sessionsService.tabToOcSessionApi({
                  ocSession: v.ocSession
                })
              : undefined
          )
      ),
      Result.bind(
        'messages',
        (v): Result.ResultAsync<OcMessageTab[], OcMessageEntToTabError> =>
          this.db.drizzle.query.ocMessagesTable
            .findMany({
              where: eq(ocMessagesTable.sessionId, v.sessionId),
              orderBy: [asc(ocMessagesTable.messageId)]
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.ocMessageEntToTabResult({ messageEnt: x })
              )
            )
      ),
      Result.bind(
        'parts',
        (v): Result.ResultAsync<OcPartTab[], OcPartEntToTabError> =>
          this.db.drizzle.query.ocPartsTable
            .findMany({
              where: eq(ocPartsTable.sessionId, v.sessionId),
              orderBy: [asc(ocPartsTable.partId)]
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.ocPartEntToTabResult({ partEnt: x })
              )
            )
      ),
      Result.bind(
        'events',
        (v): Result.ResultAsync<OcEventTab[], OcEventEntToTabError> =>
          this.db.drizzle.query.ocEventsTable
            .findMany({
              where: and(
                eq(ocEventsTable.sessionId, v.sessionId),
                gt(
                  ocEventsTable.eventIndex,
                  v.session.lastFetchEventIndex ?? -1
                )
              ),
              orderBy: [asc(ocEventsTable.eventIndex)]
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.ocEventEntToTabResult({ eventEnt: x })
              )
            )
      ),
      Result.bind(
        'sessionList',
        (
          v
        ): Result.ResultAsync<
          GetBasicSessionsListOutput,
          GetBasicSessionsListError
        > =>
          this.sessionsService.getBasicSessionsListResult({
            projectId: v.session.projectId,
            userId: v.userId,
            currentSessionId: v.sessionId
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
