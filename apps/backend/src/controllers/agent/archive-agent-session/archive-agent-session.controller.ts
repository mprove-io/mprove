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
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocEventsTable } from '#backend/drizzle/postgres/schema/oc-events';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentSandboxService } from '#backend/services/agent/agent-sandbox.service.js';
import { AgentStreamAiService } from '#backend/services/agent/agent-stream-ai.service';
import { AgentStreamOpencodeService } from '#backend/services/agent/agent-stream-opencode.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendArchiveAgentSessionRequest,
  ToBackendArchiveAgentSessionResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-archive-agent-session';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ArchiveAgentSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentSandboxService: AgentSandboxService,
    private agentStreamOpencodeService: AgentStreamOpencodeService,
    private agentStreamAiService: AgentStreamAiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendArchiveAgentSession)
  async archiveSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendArchiveAgentSessionRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (
      session.type === SessionTypeEnum.Editor &&
      [SessionStatusEnum.Active, SessionStatusEnum.Paused].indexOf(
        session.status
      ) > -1
    ) {
      let project = await this.projectsService.getProjectCheckExists({
        projectId: session.projectId
      });

      await this.agentSandboxService.stopSandbox({
        sandboxType: session.sandboxType as SandboxTypeEnum,
        sandboxId: session.sandboxId,
        e2bApiKey: project.e2bApiKey
      });
    }

    let updatedSession: SessionTab = {
      ...session,
      status: SessionStatusEnum.Archived,
      archiveReason: ArchiveReasonEnum.User
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              sessions: [updatedSession]
            }
          });

          await tx
            .delete(ocEventsTable)
            .where(and(eq(ocEventsTable.sessionId, sessionId)));
        }),
      getRetryOption(this.cs, this.logger)
    );

    setTimeout(() => {
      if (session.type === SessionTypeEnum.Explorer) {
        this.agentStreamAiService
          .publishStopStream({
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

    let sessionApi = this.sessionsService.tabToSessionApi({
      session: updatedSession
    });

    let payload: ToBackendArchiveAgentSessionResponsePayload = {
      session: sessionApi
    };

    return payload;
  }
}
