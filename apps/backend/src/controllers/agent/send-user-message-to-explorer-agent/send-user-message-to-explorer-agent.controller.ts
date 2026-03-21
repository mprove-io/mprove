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
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentStreamAiService } from '#backend/services/agent/agent-stream-ai.service';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { splitModel } from '#common/functions/split-model';
import {
  ToBackendSendUserMessageToExplorerAgentRequest,
  ToBackendSendUserMessageToExplorerAgentResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-explorer-agent';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendUserMessageToExplorerAgentController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentStreamAiService: AgentStreamAiService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToExplorerAgent)
  async sendUserMessageToExplorerAgent(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendSendUserMessageToExplorerAgentRequest = request.body;
    let {
      sessionId,
      interactionType,
      message,
      model,
      variant,
      messageId,
      partId
    } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (session.type !== SessionTypeEnum.Explorer) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_TYPE_IS_NOT_EXPLORER
      });
    }

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

    if (session.status === SessionStatusEnum.Error) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SESSION_IS_IN_ERROR_STATE
      });
    }

    if (interactionType === InteractionTypeEnum.Message) {
      let split = splitModel(model);
      let modelProvider = split ? split.providerID : session.provider;
      let modelId = split ? split.modelID : model;

      let apiKey = '';
      if (modelProvider === 'openai') {
        apiKey = project.openaiApiKey || '';
      } else if (modelProvider === 'anthropic') {
        apiKey = project.anthropicApiKey || '';
      }

      session = {
        ...session,
        model: model,
        lastMessageProviderModel: model,
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
                  sessions: [session]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );

      let lockAcquired = await this.agentStreamAiService.tryAcquireStreamLock({
        sessionId: session.sessionId
      });

      if (lockAcquired) {
        // This pod acquired the lock - fire-and-forget streaming
        this.agentStreamAiService
          .streamMessage({
            sessionId: session.sessionId,
            provider: modelProvider,
            modelId: modelId,
            apiKey: apiKey,
            userMessage: message,
            messageId: messageId,
            partId: partId,
            isLockAcquired: true
          })
          .catch(e => {
            logToConsoleBackend({
              log: e,
              logLevel: LogLevelEnum.Error,
              logger: this.logger,
              cs: this.cs
            });
          });
      } else {
        // Another pod holds the lock - delegate via pub/sub
        await this.agentStreamAiService.publishInteractCommand({
          sessionId: session.sessionId,
          provider: modelProvider,
          modelId: modelId,
          apiKey: apiKey,
          userMessage: message,
          messageId: messageId,
          partId: partId
        });
      }
    } else if (interactionType === InteractionTypeEnum.Stop) {
      let isLockExist =
        await this.agentStreamAiService.publishStopSessionStream({
          sessionId: session.sessionId
        });

      if (isLockExist) {
        await this.agentStreamAiService.waitForStreamLockRelease({
          sessionId: session.sessionId
        });
      }
    }

    let ocSession = await this.sessionsService.getOcSessionBySessionId({
      sessionId: session.sessionId
    });

    let sessionApi = this.sessionsService.tabToSessionApi({
      session: session,
      ocSession: ocSession
    });

    let payload: ToBackendSendUserMessageToExplorerAgentResponsePayload = {
      session: sessionApi
    };

    return payload;
  }
}
