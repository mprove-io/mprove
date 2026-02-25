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
import { ArchivedReasonEnum } from '#common/enums/archived-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
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

    // Ensure sandbox is connected (handles Paused status and missing client)
    if (
      session.status === SessionStatusEnum.Paused ||
      !this.sandboxService.tryGetOpenCodeClient(sessionId)
    ) {
      session = await this.ensureSandboxConnected({ session });
    }

    // Execute interaction (skip if archived due to expired sandbox)
    if (session.status !== SessionStatusEnum.Archived) {
      try {
        session = await this.executeInteraction({
          session,
          ...interactionParams
        });
      } catch (e) {
        // Sandbox may have been killed or paused by E2B — attempt recovery
        await this.agentService.stopEventStream(sessionId);
        this.sandboxService.disposeOpenCodeClient(sessionId);

        session = await this.ensureSandboxConnected({ session });

        if (session.status !== SessionStatusEnum.Archived) {
          session = await this.executeInteraction({
            session,
            ...interactionParams
          });
        }
      }
    }

    // Single save, single transform, single return
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

  private async ensureSandboxConnected(item: {
    session: SessionTab;
  }): Promise<SessionTab> {
    let { session } = item;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: session.projectId
    });

    let sandboxInfo = await this.sandboxService.getSandboxInfo({
      sandboxId: session.sandboxId,
      e2bApiKey: project.e2bApiKey
    });

    if (!sandboxInfo) {
      return {
        ...session,
        status: SessionStatusEnum.Archived,
        archivedReason: ArchivedReasonEnum.Expire
      };
    }

    let timeoutMs =
      this.cs.get<BackendConfig['sandboxTimeoutMinutes']>(
        'sandboxTimeoutMinutes'
      ) *
      60 *
      1000;

    if (sandboxInfo.state === 'paused') {
      await this.sandboxService.resumeSandbox({
        sandboxType: session.sandboxType as SandboxTypeEnum,
        sandboxId: session.sandboxId,
        e2bApiKey: project.e2bApiKey,
        timeoutMs: timeoutMs
      });
    }

    this.sandboxService.connectOpenCodeClient({
      sessionId: session.sessionId,
      sandboxBaseUrl: session.sandboxBaseUrl,
      opencodePassword: session.opencodePassword
    });

    await this.sandboxService.healthCheckOpenCode({
      sandboxBaseUrl: session.sandboxBaseUrl
    });

    await this.agentService.startEventStream({
      sessionId: session.sessionId
    });

    let now = Date.now();

    return {
      ...session,
      status: SessionStatusEnum.Active,
      runningStartTs: now,
      expiresAt: now + timeoutMs,
      lastActivityTs: now
    };
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

      await client.session.promptAsync(
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
      await this.agentService.respondToPermission({
        sessionId: sessionId,
        opencodeSessionId: session.opencodeSessionId,
        permissionId: permissionId,
        reply: reply
      });
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
    } else if (interactionType === InteractionTypeEnum.Abort) {
      let client = this.sandboxService.getOpenCodeClient(sessionId);

      await client.session.abort(
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
