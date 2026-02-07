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
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendSendAgentMessageRequest } from '#common/interfaces/to-backend/agent/to-backend-send-agent-message';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendAgentMessageController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentService: AgentService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSendAgentMessage)
  async sendMessage(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSendAgentMessageRequest = request.body;
    let { sessionId, message } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.status === SessionStatusEnum.Paused) {
      let project = await this.projectsService.getProjectCheckExists({
        projectId: session.projectId
      });

      let timeoutMs =
        this.cs.get<BackendConfig['sandboxTimeoutMinutes']>(
          'sandboxTimeoutMinutes'
        ) *
        60 *
        1000;

      await this.agentService.resumeSession({
        sessionId: sessionId,
        sandboxType: session.sandboxType as SandboxTypeEnum,
        sandboxId: session.sandboxId,
        sandboxBaseUrl: session.sandboxBaseUrl,
        sandboxAgentToken: session.sandboxAgentToken,
        e2bApiKey: project.e2bApiKey,
        timeoutMs: timeoutMs
      });

      let now = Date.now();

      let updatedSession: SessionTab = {
        ...session,
        status: SessionStatusEnum.Active,
        runningStartTs: now,
        expiresAt: now + timeoutMs,
        lastActivityTs: now
      };

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  sessions: [updatedSession]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    await this.agentService.sendMessage({
      sessionId: sessionId,
      message: message
    });

    let finalSession: SessionTab = {
      ...session,
      lastActivityTs: Date.now()
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [finalSession]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
