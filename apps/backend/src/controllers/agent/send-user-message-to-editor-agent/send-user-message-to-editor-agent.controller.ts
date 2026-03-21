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
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentOpencodeService } from '#backend/services/agent/agent-opencode.service';
import { AgentSandboxService } from '#backend/services/agent/agent-sandbox.service.js';
import { AgentStreamOpencodeService } from '#backend/services/agent/agent-stream-opencode.service';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ToBackendSendUserMessageToEditorAgentRequest,
  ToBackendSendUserMessageToEditorAgentResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-editor-agent';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendUserMessageToEditorAgentController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentStreamOpencodeService: AgentStreamOpencodeService,
    private agentOpencodeService: AgentOpencodeService,
    private agentSandboxService: AgentSandboxService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSendUserMessageToEditorAgent)
  async sendUserMessageToEditorAgent(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendSendUserMessageToEditorAgentRequest = request.body;
    let {
      sessionId,
      interactionType,
      message,
      agent,
      model,
      variant,
      permissionId,
      reply,
      questionId,
      answers,
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

    if (session.type !== SessionTypeEnum.Editor) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_TYPE_IS_NOT_EDITOR
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

    let sandboxInfo = await this.agentSandboxService.getSandboxInfo({
      sandboxId: session.sandboxId,
      e2bApiKey: project.e2bApiKey
    });

    if (isDefined(sandboxInfo) === true) {
      if (sandboxInfo.state === 'paused') {
        let isLockExist =
          await this.agentStreamOpencodeService.publishStopSessionStream({
            sessionId: session.sessionId
          });

        if (isLockExist) {
          await this.agentStreamOpencodeService.waitForStreamLockRelease({
            sessionId: session.sessionId
          });
        }

        await this.agentSandboxService.resumeSandbox({
          sandboxType: session.sandboxType as SandboxTypeEnum,
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey,
          timeoutMs:
            this.cs.get<BackendConfig['sandboxTimeoutMinutes']>(
              'sandboxTimeoutMinutes'
            ) * 60_000
        });

        sandboxInfo = await this.agentSandboxService.getSandboxInfo({
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey
        });
      }

      if (sandboxInfo.state === 'running') {
        await this.agentOpencodeService.getOpenCodeClient({
          sessionId: session.sessionId,
          sandboxBaseUrl: session.sandboxBaseUrl,
          opencodePassword: session.opencodePassword
        });

        await this.agentOpencodeService.healthCheckOpenCode({
          sandboxBaseUrl: session.sandboxBaseUrl
        });

        session.status = SessionStatusEnum.Active;
        session.sandboxStartTs = sandboxInfo.startedAt.getTime();
        session.sandboxEndTs = sandboxInfo.endAt.getTime();
        session.sandboxInfo = sandboxInfo;
        session.lastActivityTs = Date.now();
      } else {
        session.status = SessionStatusEnum.Error;
      }
    } else {
      session.status = SessionStatusEnum.Archived;
      session.archiveReason = ArchiveReasonEnum.Expire;
    }

    if (session.status === SessionStatusEnum.Active) {
      // validate message interaction early
      if (interactionType === InteractionTypeEnum.Message) {
        if (agent === undefined) {
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_MESSAGE_AGENT_REQUIRED
          });
        }

        if (model === undefined) {
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_MESSAGE_MODEL_REQUIRED
          });
        }

        if (variant === undefined) {
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_MESSAGE_VARIANT_REQUIRED
          });
        }
      }

      let isStreamStartedFresh =
        await this.agentStreamOpencodeService.startEventStream({
          sessionId: session.sessionId,
          opencodeSessionId: session.opencodeSessionId,
          skipReload: false
        });

      if (isStreamStartedFresh) {
        // this pod holds the stream — execute locally
        try {
          await this.agentStreamOpencodeService.executeInteraction({
            sessionId: session.sessionId,
            opencodeSessionId: session.opencodeSessionId,
            interactionType: interactionType,
            message: message,
            agent: agent,
            model: model,
            variant: variant,
            permissionId: permissionId,
            reply: reply,
            questionId: questionId,
            answers: answers,
            messageId: messageId,
            partId: partId
          });
        } catch (e) {
          await this.agentStreamOpencodeService.stopEventStream({
            sessionId: session.sessionId
          });

          await this.agentStreamOpencodeService.publishReloadSession({
            sessionId: session.sessionId
          });

          throw e;
        }

        await this.agentStreamOpencodeService.processEventStream({
          sessionId: session.sessionId
        });
      } else {
        // another pod holds the stream — delegate via pub/sub
        await this.agentStreamOpencodeService.publishInteractCommand({
          sessionId: session.sessionId,
          opencodeSessionId: session.opencodeSessionId,
          interactionType: interactionType,
          message: message,
          agent: agent,
          model: model,
          variant: variant,
          permissionId: permissionId,
          reply: reply,
          questionId: questionId,
          answers: answers,
          messageId: messageId,
          partId: partId
        });
      }

      if (interactionType === InteractionTypeEnum.Message) {
        session = {
          ...session,
          agent: agent,
          model: model,
          lastMessageProviderModel: model,
          lastMessageVariant: variant
        };
      }

      session.lastActivityTs = Date.now();
    }

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

    let ocSession = await this.sessionsService.getOcSessionBySessionId({
      sessionId: session.sessionId
    });

    let sessionApi = this.sessionsService.tabToSessionApi({
      session: session,
      ocSession: ocSession
    });

    let payload: ToBackendSendUserMessageToEditorAgentResponsePayload = {
      session: sessionApi
    };

    return payload;
  }
}
