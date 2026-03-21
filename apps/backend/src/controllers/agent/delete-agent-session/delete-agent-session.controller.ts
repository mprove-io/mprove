import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config.js';
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
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentSandboxService } from '#backend/services/agent/agent-sandbox.service.js';
import { AgentStreamAiService } from '#backend/services/agent/agent-stream-ai.service';
import { AgentStreamOpencodeService } from '#backend/services/agent/agent-stream-opencode.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { ToBackendDeleteAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-delete-agent-session';
import {
  ToDiskDeleteDevRepoRequest,
  ToDiskDeleteDevRepoResponse
} from '#common/interfaces/to-disk/03-repos/to-disk-delete-dev-repo';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteAgentSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentSandboxService: AgentSandboxService,
    private agentStreamOpencodeService: AgentStreamOpencodeService,
    private agentStreamAiService: AgentStreamAiService,
    private tabService: TabService,
    private rpcService: RpcService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteAgentSession)
  async deleteSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteAgentSessionRequest = request.body;
    let { traceId } = reqValid.info;
    let { sessionId } = reqValid.payload;

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
      await this.agentSandboxService.stopSandbox({
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

    setTimeout(() => {
      if (session.type === SessionTypeEnum.Explorer) {
        this.agentStreamAiService
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
        this.agentStreamOpencodeService
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
    }, 10_000);

    let payload = {};

    return payload;
  }
}
