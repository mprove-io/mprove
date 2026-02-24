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
import { SandboxService } from '#backend/services/sandbox.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { splitModel } from '#common/functions/split-model';
import { ToBackendSendUserMessageToAgentRequest } from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendUserMessageToAgentController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentService: AgentService,
    private sandboxService: SandboxService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToAgent)
  async sendUserMessage(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendSendUserMessageToAgentRequest = request.body;
    let {
      sessionId,
      interactionType,
      message,
      model,
      variant,
      permissionId,
      reply,
      questionId,
      answers
    } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.status === SessionStatusEnum.New) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SESSION_NOT_READY
      });
    }

    if (session.status === SessionStatusEnum.Archived) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SESSION_IS_ARCHIVED
      });
    }

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

      await this.sandboxService.resumeSandbox({
        sandboxType: session.sandboxType as SandboxTypeEnum,
        sandboxId: session.sandboxId,
        e2bApiKey: project.e2bApiKey,
        timeoutMs: timeoutMs
      });

      this.sandboxService.connectOpenCodeClient({
        sessionId: sessionId,
        sandboxBaseUrl: session.sandboxBaseUrl,
        opencodePassword: session.opencodePassword
      });

      await this.sandboxService.healthCheckOpenCode({
        sandboxBaseUrl: session.sandboxBaseUrl
      });

      await this.agentService.startEventStream({
        sessionId: sessionId
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
    } else if (session.status !== SessionStatusEnum.Active) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SESSION_NOT_READY
      });
    }

    if (interactionType === InteractionTypeEnum.Message) {
      let client = this.sandboxService.getOpenCodeClient(sessionId);

      let effectiveModel = model !== undefined ? model : session.model;

      let promptBody: any = {
        parts: [{ type: 'text', text: message }]
      };

      let split = splitModel(effectiveModel);
      if (split) {
        promptBody.model = split;
      }

      if (variant) {
        promptBody.variant = variant;
      }

      await client.session
        .promptAsync(
          {
            sessionID: session.opencodeSessionId,
            ...promptBody
          },
          { throwOnError: true }
        )
        .catch(e => {
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_PROMPT_FAILED,
            originalError: e
          });
        });

      let finalSession: SessionTab = {
        ...session,
        model: model !== undefined ? model : session.model,
        lastMessageProviderModel: effectiveModel,
        lastMessageVariant: variant,
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
    } else if (interactionType === InteractionTypeEnum.Permission) {
      await this.agentService.respondToPermission({
        sessionId: sessionId,
        opencodeSessionId: session.opencodeSessionId,
        permissionId: permissionId,
        reply: reply
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
    } else if (interactionType === InteractionTypeEnum.Question) {
      if (answers !== undefined) {
        await this.agentService.respondToQuestion({
          sessionId: sessionId,
          opencodeSessionId: session.opencodeSessionId,
          questionId: questionId,
          answers: answers
        });
      } else {
        await this.agentService.rejectQuestion({
          sessionId: sessionId,
          opencodeSessionId: session.opencodeSessionId,
          questionId: questionId
        });
      }

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
    }

    let payload2 = {};

    return payload2;
  }
}
