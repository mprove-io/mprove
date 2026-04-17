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
import { BackendConfig } from '#backend/config/backend-config.js';
import {
  ToBackendDeleteSessionRequestDto,
  ToBackendDeleteSessionResponseDto
} from '#backend/controllers/sessions/delete-session/delete-session.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { ocPartsTable } from '#backend/drizzle/postgres/schema/oc-parts';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { getRetryOption } from '#backend/functions/get-retry-option.js';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { BackendEnvEnum } from '#common/enums/env/backend-env.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ServerError } from '#common/models/server-error';
import type {
  ToDiskDeleteDevRepoRequest,
  ToDiskDeleteDevRepoResponse
} from '#common/zod/to-disk/03-repos/to-disk-delete-dev-repo';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private editorSandboxService: EditorSandboxService,
    private editorStreamService: EditorStreamService,
    private explorerStreamService: ExplorerStreamService,
    private tabService: TabService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteSession)
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
    let { traceId } = body.info;
    let { sessionId } = body.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    if (
      session.type === SessionTypeEnum.Editor &&
      [SessionStatusEnum.Active, SessionStatusEnum.Paused].indexOf(
        session.status
      ) > -1
    ) {
      await this.editorSandboxService.stopSandbox({
        sandboxType: session.sandboxType as SandboxTypeEnum,
        sandboxId: session.sandboxId,
        e2bApiKey: project.e2bApiKey
      });
    }

    if (session.type === SessionTypeEnum.Editor) {
      let baseProject = this.tabService.projectTabToBaseProject({
        project: project
      });

      let toDiskDeleteDevRepoRequest: ToDiskDeleteDevRepoRequest = {
        info: {
          name: ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo,
          traceId: traceId
        },
        payload: {
          orgId: project.orgId,
          projectId: session.projectId,
          baseProject: baseProject,
          devRepoId: sessionId
        }
      };

      await this.rpcService.sendToDisk<ToDiskDeleteDevRepoResponse>({
        orgId: project.orgId,
        projectId: session.projectId,
        repoId: sessionId,
        message: toDiskDeleteDevRepoRequest,
        checkIsOk: true
      });
    }

    let updatedSession: SessionTab = {
      ...session,
      status: SessionStatusEnum.Deleted
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

          if (session.type === SessionTypeEnum.Editor) {
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

    let stopDelay = backendEnv === BackendEnvEnum.TEST ? 0 : 10_000;

    setTimeout(() => {
      if (session.type === SessionTypeEnum.Explorer) {
        this.explorerStreamService
          .publishStopSessionStream({
            sessionId: sessionId
          })
          .catch(e => {
            logToConsoleBackend({
              log: e,
              logLevel: LogLevelEnum.Error,
              logger: this.logger,
              cs: this.cs
            });
          });
      } else if (session.type === SessionTypeEnum.Editor) {
        this.editorStreamService
          .publishStopSessionStream({
            sessionId: sessionId
          })
          .catch(e => {
            logToConsoleBackend({
              log: e,
              logLevel: LogLevelEnum.Error,
              logger: this.logger,
              cs: this.cs
            });
          });
      }
    }, stopDelay);

    let payload = {};

    return payload;
  }
}
