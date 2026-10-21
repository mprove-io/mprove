import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AssistantMessage } from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import { and, desc, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSendMessageToExplorerSessionRequestDto,
  ToBackendSendMessageToExplorerSessionResponseDto
} from '#backend/controllers/sessions/send-message-to-explorer-session/send-message-to-explorer-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { ocSessionsTable } from '#backend/drizzle/postgres/schema/oc-sessions';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex/codex.service';
import { DbService } from '#backend/services/db/db.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { getExplorerContextBlockThreshold } from '#common/functions/get-explorer-context-block-threshold/get-explorer-context-block-threshold';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { SendExplorerMessageError } from '#common/types/backend/function-errors/send-explorer-message-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSendMessageToExplorerSessionOutput } from '#common/types/backend/routes/sessions/send-message-to-explorer-session/send-message-to-explorer-session-output';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendMessageToExplorerSessionController {
  constructor(
    private sessionsService: SessionsService,
    private providersService: ProvidersService,
    private codexService: CodexService,
    private explorerStreamService: ExplorerStreamService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendSendMessageToExplorerSession' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'sendMessageToExplorerSession'>> {
    return Result.pipe(
      Result.succeed({
        sessionId: body.input.sessionId,
        interactionType: body.input.interactionType,
        message: body.input.message,
        providerId: body.input.providerId,
        modelId: body.input.modelId,
        variant: body.input.variant,
        messageId: body.input.messageId,
        partId: body.input.partId,
        user: user
      }),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.session.projectId)
        })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.user.userId
          ? Result.fail({ code: 'BACKEND_UNAUTHORIZED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.type !== 'Explorer'
          ? Result.fail({ code: 'BACKEND_SESSION_TYPE_IS_NOT_EXPLORER' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.status === 'New'
          ? Result.fail({ code: 'BACKEND_SESSION_NOT_READY' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.status === 'Archived'
          ? Result.fail({ code: 'BACKEND_SESSION_IS_ARCHIVED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.status === 'Error'
          ? Result.fail({ code: 'BACKEND_SESSION_IS_IN_ERROR_STATE' })
          : Result.succeed()
      ),
      Result.bind('updatedSession', async v =>
        v.interactionType === 'Message'
          ? this.sendExplorerMessage({
              session: v.session,
              user: v.user,
              providerId: v.providerId,
              modelId: v.modelId,
              variant: v.variant,
              message: v.message,
              messageId: v.messageId,
              partId: v.partId
            })
          : Result.succeed(v.session)
      ),
      Result.andThrough(async v => {
        if (v.interactionType === 'Stop') {
          let isLockExist: boolean =
            await this.explorerStreamService.publishStopSessionStream({
              sessionId: v.updatedSession.sessionId
            });

          if (isLockExist) {
            await this.explorerStreamService.waitForStreamLockRelease({
              sessionId: v.updatedSession.sessionId
            });
          }
        }

        return Result.succeed();
      }),
      Result.bind('ocSession', v =>
        this.db.ocSessions.findFirst({
          where: eq(ocSessionsTable.sessionId, v.updatedSession.sessionId)
        })
      ),
      Result.map(
        (v): ToBackendSendMessageToExplorerSessionOutput => ({
          session: this.sessionsService.tabToSessionApi({
            session: v.updatedSession,
            ocSession: v.ocSession
          })
        })
      )
    );
  }

  private async sendExplorerMessage(item: {
    session: SessionTab;
    user: UserTab;
    providerId?: string;
    modelId?: string;
    variant?: string;
    message: string;
    messageId: string;
    partId: string;
  }): Result.ResultAsync<SessionTab, SendExplorerMessageError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        isUndefined(v.providerId)
          ? Result.fail({ code: 'BACKEND_MESSAGE_PROVIDER_REQUIRED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isUndefined(v.modelId)
          ? Result.fail({ code: 'BACKEND_MESSAGE_MODEL_REQUIRED' })
          : Result.succeed()
      ),
      Result.bind('modelSelection', v =>
        this.providersService.getModelSelection({
          projectId: v.session.projectId,
          providerId: v.providerId,
          modelId: v.modelId,
          variant: v.variant,
          isUserCodexAuthSet: isDefined(v.user.codexAuth),
          isBuilder: false
        })
      ),
      Result.bind('latestAssistantMessage', v =>
        this.db.ocMessages.findFirst({
          where: and(
            eq(ocMessagesTable.sessionId, v.session.sessionId),
            eq(ocMessagesTable.role, 'assistant')
          ),
          orderBy: [desc(ocMessagesTable.createdTs)]
        })
      ),
      Result.andThrough(v => {
        if (isDefined(v.latestAssistantMessage)) {
          let assistantMessage: AssistantMessage = v.latestAssistantMessage
            .ocMessage as AssistantMessage;

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
              contextLimit: v.modelSelection.model.contextLimit,
              inputLimit: v.modelSelection.model.inputLimit,
              outputLimit: v.modelSelection.model.outputLimit
            });

            if (isDefined(blockThreshold) && total >= blockThreshold) {
              return Result.fail({
                code: 'BACKEND_EXPLORER_CONTEXT_LIMIT_REACHED'
              });
            }
          }
        }

        return Result.succeed();
      }),
      // Ensure codex auth is fresh in DB before stream / interact dispatch
      Result.andThrough(async v =>
        v.modelSelection.provider.type === 'OpenAICodex'
          ? this.codexService.prewarmCodexAuth({ userId: v.user.userId })
          : Result.succeed()
      ),
      Result.bind('updatedSession', v => {
        let updatedSession: SessionTab = {
          ...v.session,
          providerId: v.providerId,
          modelId: v.modelId,
          lastMessageVariant: v.variant,
          codexAuthUpdateTs:
            v.modelSelection.provider.type === 'OpenAICodex'
              ? v.user.codexAuthUpdateTs
              : undefined,
          lastActivityTs: Date.now()
        };

        return Result.succeed(updatedSession);
      }),
      Result.andThrough(v =>
        this.db.write({
          insertOrUpdate: { sessions: [v.updatedSession] }
        })
      ),
      Result.andThrough(async v => {
        let isLockAcquired: boolean =
          await this.explorerStreamService.tryAcquireStreamLock({
            sessionId: v.updatedSession.sessionId
          });

        if (isLockAcquired) {
          // This pod acquired the lock - fire-and-forget streaming
          void this.explorerStreamService
            .streamMessage({
              sessionId: v.updatedSession.sessionId,
              provider: v.providerId,
              modelId: v.modelId,
              variant: v.variant,
              userMessage: v.message,
              messageId: v.messageId,
              partId: v.partId,
              isLockAcquired: true
            })
            .catch(e => {
              logToConsoleBackend({
                log: e,
                logLevel: 'Error',
                logger: this.logger,
                cs: this.cs
              });
            });

          return Result.succeed();
        }

        // Another pod holds the lock - delegate via pub/sub
        return this.explorerStreamService.publishInteractCommand({
          sessionId: v.updatedSession.sessionId,
          provider: v.providerId,
          modelId: v.modelId,
          variant: v.variant,
          userMessage: v.message,
          messageId: v.messageId,
          partId: v.partId
        });
      }),
      Result.map((v): SessionTab => v.updatedSession)
    );
  }
}
