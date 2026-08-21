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
import type { AssistantMessage } from '@opencode-ai/sdk/v2';
import retry from 'async-retry';
import { and, desc, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSendMessageToExplorerSessionRequestDto,
  ToBackendSendMessageToExplorerSessionResponseDto
} from '#backend/controllers/sessions/send-message-to-explorer-session/send-message-to-explorer-session.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcMessageTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { getExplorerContextBlockThreshold } from '#common/functions/get-explorer-context-block-threshold';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendSendMessageToExplorerSessionResponsePayload } from '#common/zod/to-backend/sessions/to-backend-send-message-to-explorer-session';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendMessageToExplorerSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private codexService: CodexService,
    private explorerStreamService: ExplorerStreamService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendSendMessageToExplorerSession)
  @ApiOperation({
    summary: 'SendMessageToExplorerSession',
    description: 'Send a message or interaction to an explorer session'
  })
  @ApiOkResponse({
    type: ToBackendSendMessageToExplorerSessionResponseDto
  })
  async sendMessageToExplorerSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSendMessageToExplorerSessionRequestDto
  ) {
    let {
      sessionId,
      interactionType,
      message,
      providerId,
      modelId,
      variant,
      messageId,
      partId
    } = body.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId: sessionId
    });

    await this.projectsService.getProjectCheckExists({
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
        message: ErEnum.BACKEND_SESSION_NOT_READY
      });
    }

    if (session.status === SessionStatusEnum.Archived) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_IS_ARCHIVED
      });
    }

    if (session.status === SessionStatusEnum.Error) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_IS_IN_ERROR_STATE
      });
    }

    if (interactionType === InteractionTypeEnum.Message) {
      if (isDefined(providerId) === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_MESSAGE_PROVIDER_REQUIRED
        });
      }

      if (isDefined(modelId) === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_MESSAGE_MODEL_REQUIRED
        });
      }

      let modelSelection = await this.providersService.getModelSelection({
        projectId: session.projectId,
        providerId: providerId,
        modelId: modelId,
        isUserCodexAuthSet: isDefined(user.codexAuth),
        isBuilder: false
      });

      let latestAssistantMessageEnt =
        await this.db.drizzle.query.ocMessagesTable.findFirst({
          where: and(
            eq(ocMessagesTable.sessionId, session.sessionId),
            eq(ocMessagesTable.role, 'assistant')
          ),
          orderBy: [desc(ocMessagesTable.createdTs)]
        });

      if (isDefined(latestAssistantMessageEnt)) {
        let latestAssistantMessageTab: OcMessageTab =
          this.tabService.ocMessageEntToTab(latestAssistantMessageEnt);

        let assistantMessage =
          latestAssistantMessageTab.ocMessage as AssistantMessage;

        if (isDefined(assistantMessage.tokens)) {
          let total: number =
            assistantMessage.tokens.input +
            assistantMessage.tokens.output +
            assistantMessage.tokens.reasoning +
            assistantMessage.tokens.cache.read +
            assistantMessage.tokens.cache.write;

          let blockThreshold: ReturnType<
            typeof getExplorerContextBlockThreshold
          > = getExplorerContextBlockThreshold({
            contextLimit: modelSelection.model.contextLimit,
            inputLimit: modelSelection.model.inputLimit,
            outputLimit: modelSelection.model.outputLimit
          });

          if (isDefined(blockThreshold) && total >= blockThreshold) {
            throw new ServerError({
              message: ErEnum.BACKEND_EXPLORER_CONTEXT_LIMIT_REACHED
            });
          }
        }
      }

      let isCodex =
        modelSelection.provider.type === ProviderTypeEnum.OpenAICodex;

      // Ensure codex auth is fresh in DB before stream / interact dispatch
      if (isCodex) {
        await this.codexService.prewarmCodexAuth({
          userId: user.userId
        });
      }

      session = {
        ...session,
        providerId: providerId,
        modelId: modelId,
        lastMessageVariant: variant,
        codexAuthUpdateTs: isCodex ? user.codexAuthUpdateTs : undefined,
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

      let lockAcquired = await this.explorerStreamService.tryAcquireStreamLock({
        sessionId: session.sessionId
      });

      if (lockAcquired) {
        // This pod acquired the lock - fire-and-forget streaming
        this.explorerStreamService
          .streamMessage({
            sessionId: session.sessionId,
            provider: providerId,
            modelId: modelId,
            variant: variant,
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
        await this.explorerStreamService.publishInteractCommand({
          sessionId: session.sessionId,
          provider: providerId,
          modelId: modelId,
          variant: variant,
          userMessage: message,
          messageId: messageId,
          partId: partId
        });
      }
    } else if (interactionType === InteractionTypeEnum.Stop) {
      let isLockExist =
        await this.explorerStreamService.publishStopSessionStream({
          sessionId: session.sessionId
        });

      if (isLockExist) {
        await this.explorerStreamService.waitForStreamLockRelease({
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

    let payload: ToBackendSendMessageToExplorerSessionResponsePayload = {
      session: sessionApi
    };

    return payload;
  }
}
