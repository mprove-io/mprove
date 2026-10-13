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
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, desc, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSendMessageToExplorerSessionRequestDto,
  ToBackendSendMessageToExplorerSessionResponseDto
} from '#backend/controllers/sessions/send-message-to-explorer-session/send-message-to-explorer-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcMessageTab,
  OcSessionTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ocMessagesTable } from '#backend/drizzle/postgres/schema/oc-messages';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex/codex.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { GetModelSelectionOutput } from '#backend/services/db/providers/providers.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { ExplorerStreamService } from '#backend/services/explorer/explorer-stream/explorer-stream.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { getExplorerContextBlockThreshold } from '#common/functions/get-explorer-context-block-threshold/get-explorer-context-block-threshold';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetModelSelectionError } from '#common/types/backend/function-errors/get-model-selection-error';
import type { GetOcSessionBySessionIdError } from '#common/types/backend/function-errors/get-oc-session-by-session-id-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { OcMessageEntToTabError } from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';
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
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private codexService: CodexService,
    private explorerStreamService: ExplorerStreamService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'session',
        (v): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> =>
          this.sessionsService.getSessionByIdCheckExistsResult({
            sessionId: v.sessionId
          })
      ),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.session.projectId
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
      Result.bind(
        'updatedSession',
        async (v): Result.ResultAsync<SessionTab, SendExplorerMessageError> =>
          v.interactionType === 'Message'
            ? this.sendExplorerMessageResult({
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
      Result.bind(
        'ocSession',
        (v): Result.ResultAsync<OcSessionTab, GetOcSessionBySessionIdError> =>
          this.sessionsService.getOcSessionBySessionIdResult({
            sessionId: v.updatedSession.sessionId
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

  private async sendExplorerMessageResult(item: {
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
      Result.bind(
        'modelSelection',
        (
          v
        ): Result.ResultAsync<
          GetModelSelectionOutput,
          GetModelSelectionError
        > =>
          this.providersService.getModelSelectionResult({
            projectId: v.session.projectId,
            providerId: v.providerId,
            modelId: v.modelId,
            variant: v.variant,
            isUserCodexAuthSet: isDefined(v.user.codexAuth),
            isBuilder: false
          })
      ),
      Result.bind(
        'latestAssistantMessage',
        (v): Result.ResultAsync<OcMessageTab, OcMessageEntToTabError> =>
          this.db.drizzle.query.ocMessagesTable
            .findFirst({
              where: and(
                eq(ocMessagesTable.sessionId, v.session.sessionId),
                eq(ocMessagesTable.role, 'assistant')
              ),
              orderBy: [desc(ocMessagesTable.createdTs)]
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.ocMessageEntToTabResult({ messageEnt: x })
            )
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
          ? this.codexService.prewarmCodexAuthResult({ userId: v.user.userId })
          : Result.succeed()
      ),
      Result.bind(
        'updatedSession',
        (v): Result.Result<SessionTab, never> =>
          Result.succeed({
            ...v.session,
            providerId: v.providerId,
            modelId: v.modelId,
            lastMessageVariant: v.variant,
            codexAuthUpdateTs:
              v.modelSelection.provider.type === 'OpenAICodex'
                ? v.user.codexAuthUpdateTs
                : undefined,
            lastActivityTs: Date.now()
          })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insertOrUpdate: { sessions: [v.updatedSession] }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
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
        return this.explorerStreamService.publishInteractCommandResult({
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
