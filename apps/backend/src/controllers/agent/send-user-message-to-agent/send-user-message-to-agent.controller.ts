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
import type { SessionPromptAsyncData } from '@opencode-ai/sdk/v2';
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
import { AgentStreamAiService } from '#backend/services/agent/agent-stream-ai.service';
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
import { splitModel } from '#common/functions/split-model';
import {
  ToBackendSendUserMessageToAgentRequest,
  ToBackendSendUserMessageToAgentResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-send-user-message-to-agent';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendUserMessageToAgentController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentStreamAiService: AgentStreamAiService,
    private agentStreamOpencodeService: AgentStreamOpencodeService,
    private agentOpencodeService: AgentOpencodeService,
    private agentSandboxService: AgentSandboxService,
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
      agent,
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

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
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

    // Explorer: direct AI SDK, no sandbox
    if (session.type === SessionTypeEnum.Explorer) {
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

        // Fire-and-forget streaming
        this.agentStreamAiService
          .streamMessage({
            sessionId: session.sessionId,
            provider: modelProvider,
            modelId: modelId,
            apiKey: apiKey,
            userMessage: message
          })
          .catch(() => {});
      } else if (interactionType === InteractionTypeEnum.Stop) {
        let isLockExist = await this.agentStreamAiService.publishStopStream({
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

      let payload: ToBackendSendUserMessageToAgentResponsePayload = {
        session: sessionApi
      };

      return payload;
    }

    // Editor: sandboxed opencode flow
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
      let isStreamStartedFresh =
        await this.agentStreamOpencodeService.startEventStream({
          sessionId: session.sessionId,
          opencodeSessionId: session.opencodeSessionId
        });

      // execute interaction
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

        let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
          sessionId: sessionId
        });

        let promptBody: NonNullable<SessionPromptAsyncData['body']> = {
          parts: [{ type: 'text', text: message }]
        };

        promptBody.agent = agent;

        let split = splitModel(model);

        if (split) {
          promptBody.model = split;
        }

        if (variant) {
          promptBody.variant = variant;
        }

        await opencodeClient.session.promptAsync(
          {
            sessionID: session.opencodeSessionId,
            ...promptBody
          },
          { throwOnError: true }
        );

        session = {
          ...session,
          agent: agent,
          model: model,
          lastMessageProviderModel: model,
          lastMessageVariant: variant
        };
      } else if (interactionType === InteractionTypeEnum.Permission) {
        await this.agentStreamOpencodeService.respondToPermission({
          sessionId: sessionId,
          opencodeSessionId: session.opencodeSessionId,
          permissionId: permissionId,
          reply: reply
        });
      } else if (interactionType === InteractionTypeEnum.Question) {
        if (answers !== undefined) {
          await this.agentStreamOpencodeService.respondToQuestion({
            sessionId: sessionId,
            opencodeSessionId: session.opencodeSessionId,
            questionId: questionId,
            answers: answers
          });
        } else {
          await this.agentStreamOpencodeService.rejectQuestion({
            sessionId: sessionId,
            opencodeSessionId: session.opencodeSessionId,
            questionId: questionId
          });
        }
      } else if (interactionType === InteractionTypeEnum.Stop) {
        let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
          sessionId: sessionId
        });

        await opencodeClient.session.abort(
          {
            sessionID: session.opencodeSessionId
          },
          { throwOnError: true }
        );
      }

      session.lastActivityTs = Date.now();

      if (isStreamStartedFresh) {
        await this.agentStreamOpencodeService.processEventStream({
          sessionId: session.sessionId
        });
      }
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
      session,
      ocSession
    });

    let payload: ToBackendSendUserMessageToAgentResponsePayload = {
      session: sessionApi
    };

    return payload;
  }
}
