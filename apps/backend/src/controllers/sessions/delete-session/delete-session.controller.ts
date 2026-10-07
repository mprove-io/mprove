import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteSessionRequestDto,
  ToBackendDeleteSessionResponseDto
} from '#backend/controllers/sessions/delete-session/delete-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private editorSandboxService: EditorSandboxService,
    private editorSessionLockService: EditorSessionLockService,
    private editorStreamService: EditorStreamService,
    private explorerStreamService: ExplorerStreamService,
    private tabService: TabService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
  ) {
    let { traceId } = body;
    let { sessionId } = body.input;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: 'BACKEND_UNAUTHORIZED'
      });
    }

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    let sessionLockToken =
      session.type === 'Editor'
        ? await this.editorSessionLockService.acquireSessionLock({
            sessionId: session.sessionId
          })
        : undefined;

    try {
      if (session.type === 'Editor') {
        session = await this.sessionsService.getSessionByIdCheckExists({
          sessionId: session.sessionId
        });
      }

      if (
        session.type === 'Editor' &&
        (['Active', 'Paused'] satisfies SessionStatus[]).findIndex(
          candidate => candidate === session.status
        ) > -1
      ) {
        await this.editorSandboxService.stopSandbox({
          sandboxType: session.sandboxType as SandboxType,
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey
        });
      }

      if (session.type === 'Editor') {
        let baseProject = this.tabService.projectTabToBaseProject({
          project: project
        });

        await this.rpcService.sendToDiskUnwrapOutput({
          request: {
            operation: 'deleteDevRepo',
            traceId: traceId,
            input: {
              baseProject: baseProject,
              devRepoId: sessionId
            }
          }
        });
      }

      let updatedSession: SessionTab = {
        ...session,
        status: 'Deleted'
      };

      await this.db.drizzle.transaction(
        async tx =>
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              sessions: [updatedSession]
            }
          })
      );

      await retry(
        async () =>
          await this.db.drizzle.transaction(async tx => {
            await tx
              .delete(ocMessagesTable)
              .where(and(eq(ocMessagesTable.sessionId, sessionId)));

            await tx
              .delete(ocPartsTable)
              .where(and(eq(ocPartsTable.sessionId, sessionId)));

            await tx
              .delete(ocEventsTable)
              .where(and(eq(ocEventsTable.sessionId, sessionId)));

            await tx
              .delete(ocSessionsTable)
              .where(and(eq(ocSessionsTable.sessionId, sessionId)));

            if (session.type === 'Explorer') {
              await tx
                .delete(chartsTable)
                .where(eq(chartsTable.sessionId, sessionId));

              await tx
                .delete(mconfigsTable)
                .where(eq(mconfigsTable.sessionId, sessionId));

              await tx
                .delete(queriesTable)
                .where(eq(queriesTable.sessionId, sessionId));
            }

            if (session.type === 'Editor') {
              await tx
                .delete(branchesTable)
                .where(
                  and(
                    eq(branchesTable.projectId, session.projectId),
                    eq(branchesTable.repoId, sessionId)
                  )
                );

              await tx
                .delete(bridgesTable)
                .where(
                  and(
                    eq(bridgesTable.projectId, session.projectId),
                    eq(bridgesTable.repoId, sessionId)
                  )
                );
            }
          }),
        getRetryOption(this.cs, this.logger)
      );

      let backendEnv = this.cs.get<BackendConfig['backendEnv']>('backendEnv');

      let stopDelay = backendEnv === 'TEST' ? 0 : 10_000;

      setTimeout(() => {
        if (session.type === 'Explorer') {
          this.explorerStreamService
            .publishStopSessionStream({
              sessionId: sessionId
            })
            .catch(e => {
              logToConsoleBackend({
                log: e,
                logLevel: 'Error',
                logger: this.logger,
                cs: this.cs
              });
            });
        } else if (session.type === 'Editor') {
          this.editorStreamService
            .publishStopSessionStream({
              sessionId: sessionId
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

      let payload = {};

      return payload;
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
