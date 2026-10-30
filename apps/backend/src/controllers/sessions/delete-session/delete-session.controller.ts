import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteSessionRequestDto,
  ToBackendDeleteSessionResponseDto
} from '#backend/controllers/sessions/delete-session/delete-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { branchesTable } from '#backend/drizzle/postgres/tables/branches';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { ocEventsTable } from '#backend/drizzle/postgres/tables/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/tables/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/tables/oc-parts';
import { ocSessionsTable } from '#backend/drizzle/postgres/tables/oc-sessions';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import type { SessionTab } from '#backend/drizzle/postgres/tables/sessions';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { projectTabToBaseProject } from '#backend/functions/db/projects/project-tab-to-base-project/project-tab-to-base-project';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DeleteWhileLockedError } from '#common/types/backend/function-errors/delete-while-locked-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteSessionOutput } from '#common/types/backend/routes/sessions/delete-session/delete-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteSessionController {
  constructor(
    private tabService: TabService,
    private editorSandboxService: EditorSandboxService,
    private editorSessionLockService: EditorSessionLockService,
    private editorStreamService: EditorStreamService,
    private explorerStreamService: ExplorerStreamService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteSession' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteSession',
    description: 'Delete a session'
  })
  @ApiOkResponse({
    type: ToBackendDeleteSessionResponseDto
  })
  async deleteSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteSessionRequestDto
  ): Promise<BackendResultForOperation<'deleteSession'>> {
    return Result.pipe(
      Result.succeed({
        traceId: body.traceId,
        sessionId: body.input.sessionId,
        userId: user.userId
      }),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.userId
          ? Result.fail({ code: 'BACKEND_UNAUTHORIZED' })
          : Result.succeed()
      ),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.session.projectId)
        })
      ),
      Result.bind('sessionLockToken', async v =>
        v.session.type === 'Editor'
          ? this.editorSessionLockService.acquireSessionLock({
              sessionId: v.session.sessionId
            })
          : Result.succeed(undefined)
      ),
      Result.andThen(v =>
        this.deleteWhileLocked({
          traceId: v.traceId,
          sessionId: v.sessionId,
          session: v.session,
          project: v.project,
          sessionLockToken: v.sessionLockToken
        })
      )
    );
  }

  private async deleteWhileLocked(item: {
    traceId: string;
    sessionId: string;
    session: SessionTab;
    project: ProjectTab;
    sessionLockToken?: string;
  }): Result.ResultAsync<ToBackendDeleteSessionOutput, DeleteWhileLockedError> {
    let { session, sessionLockToken } = item;

    try {
      let result = await Result.pipe(
        Result.succeed(item),
        Result.bind('freshSession', async v =>
          v.session.type === 'Editor'
            ? this.db.sessions.findFirstCheckExists({
                where: eq(sessionsTable.sessionId, v.session.sessionId)
              })
            : Result.succeed(v.session)
        ),
        Result.andThrough(v => {
          let isActiveOrPaused: boolean = (
            ['Active', 'Paused'] satisfies SessionStatus[]
          ).some(status => status === v.freshSession.status);

          return v.freshSession.type === 'Editor' && isActiveOrPaused
            ? this.editorSandboxService.stopSandbox({
                sandboxType: v.freshSession.sandboxType,
                sandboxId: v.freshSession.sandboxId,
                e2bApiKey: v.project.e2bApiKey
              })
            : Result.succeed();
        }),
        Result.andThrough(async v => {
          if (v.freshSession.type !== 'Editor') {
            return Result.succeed();
          }

          let baseProject: BaseProject = projectTabToBaseProject({
            tabService: this.tabService,
            project: v.project
          });

          return this.rpcService.sendToDisk({
            request: {
              operation: 'deleteDevRepo',
              traceId: v.traceId,
              input: {
                baseProject: baseProject,
                devRepoId: v.sessionId
              }
            }
          });
        }),
        Result.bind('updatedSession', v => {
          let updatedSession: SessionTab = {
            ...v.freshSession,
            status: 'Deleted'
          };

          return Result.succeed(updatedSession);
        }),
        Result.andThrough(v =>
          dbErrorToResult({
            action: async () => {
              await this.db.writeUnwrap({
                insertOrUpdate: {
                  sessions: [v.updatedSession]
                }
              });
            }
          })
        ),
        Result.andThrough(async v => {
          await retry(
            async () =>
              await this.db.drizzle.transaction(async tx => {
                await tx
                  .delete(ocMessagesTable)
                  .where(and(eq(ocMessagesTable.sessionId, v.sessionId)));

                await tx
                  .delete(ocPartsTable)
                  .where(and(eq(ocPartsTable.sessionId, v.sessionId)));

                await tx
                  .delete(ocEventsTable)
                  .where(and(eq(ocEventsTable.sessionId, v.sessionId)));

                await tx
                  .delete(ocSessionsTable)
                  .where(and(eq(ocSessionsTable.sessionId, v.sessionId)));

                if (v.freshSession.type === 'Explorer') {
                  await tx
                    .delete(chartsTable)
                    .where(eq(chartsTable.sessionId, v.sessionId));

                  await tx
                    .delete(mconfigsTable)
                    .where(eq(mconfigsTable.sessionId, v.sessionId));

                  await tx
                    .delete(queriesTable)
                    .where(eq(queriesTable.sessionId, v.sessionId));
                }

                if (v.freshSession.type === 'Editor') {
                  await tx
                    .delete(branchesTable)
                    .where(
                      and(
                        eq(branchesTable.projectId, v.freshSession.projectId),
                        eq(branchesTable.repoId, v.sessionId)
                      )
                    );

                  await tx
                    .delete(bridgesTable)
                    .where(
                      and(
                        eq(bridgesTable.projectId, v.freshSession.projectId),
                        eq(bridgesTable.repoId, v.sessionId)
                      )
                    );
                }
              }),
            getRetryOption(this.cs, this.logger)
          );
          return Result.succeed();
        }),
        Result.andThrough(v => {
          let backendEnv: BackendConfig['backendEnv'] =
            this.cs.get<BackendConfig['backendEnv']>('backendEnv');

          let stopDelay = backendEnv === 'TEST' ? 0 : 10_000;

          setTimeout(() => {
            if (v.freshSession.type === 'Explorer') {
              void this.explorerStreamService
                .publishStopSessionStream({
                  sessionId: v.sessionId
                })
                .catch(e => {
                  logToConsoleBackend({
                    log: e,
                    logLevel: 'Error',
                    logger: this.logger,
                    cs: this.cs
                  });
                });
            } else if (v.freshSession.type === 'Editor') {
              void this.editorStreamService
                .publishStopSessionStream({
                  sessionId: v.sessionId
                })
                .catch(e => {
                  logToConsoleBackend({
                    log: e,
                    logLevel: 'Error',
                    logger: this.logger,
                    cs: this.cs
                  });
                });
            }
          }, stopDelay);
          return Result.succeed();
        }),
        Result.map((v): ToBackendDeleteSessionOutput => ({}))
      );

      return result;
    } finally {
      if (isDefined(sessionLockToken)) {
        await this.editorSessionLockService.releaseSessionLock({
          sessionId: session.sessionId,
          token: sessionLockToken
        });
      }
    }
  }
}
