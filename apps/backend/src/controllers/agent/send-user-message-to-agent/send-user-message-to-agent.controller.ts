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
import { AgentSandboxService } from '#backend/services/agent-sandbox.service';
import { AgentStreamService } from '#backend/services/agent-stream.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
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
    private agentStreamService: AgentStreamService,
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

    let interactionParams = {
      interactionType,
      message,
      model,
      variant,
      permissionId,
      reply,
      questionId,
      answers
    };

    let opencodeClient = this.agentSandboxService.getOpenCodeClient(sessionId);

    if (session.status === SessionStatusEnum.Paused || !opencodeClient) {
      session = await this.agentSandboxService.ensureSandboxConnected({
        session
      });
    }

    if (session.status !== SessionStatusEnum.Archived) {
      await this.agentStreamService.startEventStream({
        sessionId: session.sessionId,
        opencodeSessionId: session.opencodeSessionId
      });

      try {
        session = await this.executeInteraction({
          session,
          ...interactionParams
        });
      } catch (e) {
        session = await this.agentSandboxService.ensureSandboxConnected({
          session
        });

        if (session.status !== SessionStatusEnum.Archived) {
          await this.agentStreamService.startEventStream({
            sessionId: session.sessionId,
            opencodeSessionId: session.opencodeSessionId
          });

          session = await this.executeInteraction({
            session,
            ...interactionParams
          });
        }
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

  private async executeInteraction(item: {
    session: SessionTab;
    interactionType: InteractionTypeEnum;
    message?: string;
    model?: string;
    variant?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
  }): Promise<SessionTab> {
    let {
      session,
      interactionType,
      message,
      model,
      variant,
      permissionId,
      reply,
      questionId,
      answers
    } = item;
    let sessionId = session.sessionId;

    if (interactionType === InteractionTypeEnum.Message) {
      let opencodeClient =
        this.agentSandboxService.getOpenCodeClientCheckExists(sessionId);

      let effectiveModel = model !== undefined ? model : session.model;

      let promptBody: any = {
        parts: [{ type: 'text', text: message }]
      };

      if (session.agent) {
        promptBody.agent = session.agent;
      }

      let split = splitModel(effectiveModel);

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
        model: model !== undefined ? model : session.model,
        lastMessageProviderModel: effectiveModel,
        lastMessageVariant: variant
      };
    } else if (interactionType === InteractionTypeEnum.Permission) {
      await this.agentStreamService.respondToPermission({
        sessionId: sessionId,
        opencodeSessionId: session.opencodeSessionId,
        permissionId: permissionId,
        reply: reply
      });
    } else if (interactionType === InteractionTypeEnum.Question) {
      if (answers !== undefined) {
        await this.agentStreamService.respondToQuestion({
          sessionId: sessionId,
          opencodeSessionId: session.opencodeSessionId,
          questionId: questionId,
          answers: answers
        });
      } else {
        await this.agentStreamService.rejectQuestion({
          sessionId: sessionId,
          opencodeSessionId: session.opencodeSessionId,
          questionId: questionId
        });
      }
    } else if (interactionType === InteractionTypeEnum.Abort) {
      let opencodeClient =
        this.agentSandboxService.getOpenCodeClientCheckExists(sessionId);

      await opencodeClient.session.abort(
        {
          sessionID: session.opencodeSessionId
        },
        { throwOnError: true }
      );
    }

    return {
      ...session,
      lastActivityTs: Date.now()
    };
  }
}
