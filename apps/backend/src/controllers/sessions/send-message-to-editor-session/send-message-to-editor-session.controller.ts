import crypto from 'node:crypto';
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
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSendMessageToEditorSessionRequestDto,
  ToBackendSendMessageToEditorSessionResponseDto
} from '#backend/controllers/sessions/send-message-to-editor-session/send-message-to-editor-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  OcSessionTab,
  ProjectTab,
  ProviderTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { buildSessionApiKey } from '#backend/functions/api-key/build-session-api-key/build-session-api-key';
import { generateApiKeyParts } from '#backend/functions/api-key/generate-api-key-parts/generate-api-key-parts';
import { customRetry } from '#backend/functions/custom-retry/custom-retry';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex/codex.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { GetModelSelectionOutput } from '#backend/services/db/providers/providers.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex/editor-codex.service';
import {
  EditorOpencodeService,
  type ProviderConfigResult
} from '#backend/services/editor/editor-opencode/editor-opencode.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock/editor-session-lock.service';
import type { ExecuteInteractionOutput } from '#backend/services/editor/editor-stream/editor-stream.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { CODEX_PROVIDER_ID } from '#common/constants/providers';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { AcquireSessionLockError } from '#common/types/backend/function-errors/acquire-session-lock-error';
import type { DispatchEditorInteractionError } from '#common/types/backend/function-errors/dispatch-editor-interaction-error';
import type { ExecuteInteractionError } from '#common/types/backend/function-errors/execute-interaction-error';
import type { GetEnabledProvidersError } from '#common/types/backend/function-errors/get-enabled-providers-error';
import type { GetModelSelectionError } from '#common/types/backend/function-errors/get-model-selection-error';
import type { GetOcSessionBySessionIdError } from '#common/types/backend/function-errors/get-oc-session-by-session-id-error';
import type { GetOpenCodeClientError } from '#common/types/backend/function-errors/get-open-code-client-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';
import type { HealthCheckOpenCodeError } from '#common/types/backend/function-errors/health-check-open-code-error';
import type { PrepareEditorSandboxError } from '#common/types/backend/function-errors/prepare-editor-sandbox-error';
import type { PublishInteractCommandError } from '#common/types/backend/function-errors/publish-interact-command-error';
import type { RestartOpencodeServerError } from '#common/types/backend/function-errors/restart-opencode-server-error';
import type { ResumeSandboxError } from '#common/types/backend/function-errors/resume-sandbox-error';
import type { SaveSessionError } from '#common/types/backend/function-errors/save-session-error';
import type { SendEditorInteractionWhileLockedError } from '#common/types/backend/function-errors/send-editor-interaction-while-locked-error';
import type { StartEventStreamError } from '#common/types/backend/function-errors/start-event-stream-error';
import type { ValidateSessionStatusError } from '#common/types/backend/function-errors/validate-session-status-error';
import type { InteractionType } from '#common/types/backend/parts/session/interaction-type';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendSendMessageToEditorSessionOutput } from '#common/types/backend/routes/sessions/send-message-to-editor-session/send-message-to-editor-session-output';

type MakeRotatedSessionCredentialsOutput = {
  session: SessionTab;
  sessionApiKey: string;
};

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class SendMessageToEditorSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private usersService: UsersService,
    private editorStreamService: EditorStreamService,
    private editorSessionLockService: EditorSessionLockService,
    private editorOpencodeService: EditorOpencodeService,
    private editorCodexService: EditorCodexService,
    private editorSandboxService: EditorSandboxService,
    private codexService: CodexService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendSendMessageToEditorSession' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'SendMessageToEditorSession',
    description: 'Send a message or interaction to an editor session'
  })
  @ApiOkResponse({
    type: ToBackendSendMessageToEditorSessionResponseDto
  })
  async sendMessageToEditorSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendSendMessageToEditorSessionRequestDto
  ): Promise<BackendResultForOperation<'sendMessageToEditorSession'>> {
    return Result.pipe(
      Result.succeed({
        sessionId: body.input.sessionId,
        interactionType: body.input.interactionType,
        message: body.input.message,
        agent: body.input.agent,
        providerId: body.input.providerId,
        modelId: body.input.modelId,
        variant: body.input.variant,
        permissionId: body.input.permissionId,
        reply: body.input.reply,
        questionId: body.input.questionId,
        answers: body.input.answers,
        messageId: body.input.messageId,
        partId: body.input.partId,
        user: user
      }),
      Result.bind(
        'session',
        (v): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> =>
          this.sessionsService.getSessionByIdCheckExists({
            sessionId: v.sessionId
          })
      ),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExists({
            projectId: v.session.projectId
          })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.user.userId
          ? Result.fail({ code: 'BACKEND_UNAUTHORIZED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.type !== 'Editor'
          ? Result.fail({ code: 'BACKEND_SESSION_TYPE_IS_NOT_EDITOR' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.validateSessionStatus({ session: v.session })
      ),
      Result.andThrough(v =>
        v.interactionType === 'Message' && isUndefined(v.providerId)
          ? Result.fail({ code: 'BACKEND_MESSAGE_PROVIDER_REQUIRED' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.interactionType === 'Message' && isUndefined(v.modelId)
          ? Result.fail({ code: 'BACKEND_MESSAGE_MODEL_REQUIRED' })
          : Result.succeed()
      ),
      Result.bind(
        'modelSelection',
        async (
          v
        ): Result.ResultAsync<
          GetModelSelectionOutput,
          GetModelSelectionError
        > =>
          v.interactionType === 'Message'
            ? this.providersService.getModelSelection({
                projectId: v.session.projectId,
                providerId: v.providerId,
                modelId: v.modelId,
                variant: v.variant,
                isUserCodexAuthSet: isDefined(v.user.codexAuth),
                isBuilder: true
              })
            : Result.succeed(undefined)
      ),
      Result.bind(
        'sessionLockToken',
        (v): Result.ResultAsync<string, AcquireSessionLockError> =>
          this.editorSessionLockService.acquireSessionLock({
            sessionId: v.session.sessionId
          })
      ),
      Result.bind(
        'updatedSession',
        (
          v
        ): Result.ResultAsync<
          SessionTab,
          SendEditorInteractionWhileLockedError
        > =>
          this.sendEditorInteractionWhileLocked({
            session: v.session,
            project: v.project,
            sessionLockToken: v.sessionLockToken,
            user: v.user,
            isMessageUsesCodex:
              v.modelSelection?.provider.type === 'OpenAICodex',
            interactionType: v.interactionType,
            message: v.message,
            agent: v.agent,
            providerId: v.providerId,
            modelId: v.modelId,
            variant: v.variant,
            permissionId: v.permissionId,
            reply: v.reply,
            questionId: v.questionId,
            answers: v.answers,
            messageId: v.messageId,
            partId: v.partId
          })
      ),
      Result.bind(
        'ocSession',
        (v): Result.ResultAsync<OcSessionTab, GetOcSessionBySessionIdError> =>
          this.sessionsService.getOcSessionBySessionId({
            sessionId: v.updatedSession.sessionId
          })
      ),
      Result.map(
        (v): ToBackendSendMessageToEditorSessionOutput => ({
          session: this.sessionsService.tabToSessionApi({
            session: v.updatedSession,
            ocSession: v.ocSession
          })
        })
      )
    );
  }

  private async sendEditorInteractionWhileLocked(item: {
    session: SessionTab;
    project: ProjectTab;
    sessionLockToken: string;
    user: UserTab;
    isMessageUsesCodex: boolean;
    interactionType: InteractionType;
    message?: string;
    agent?: string;
    providerId?: string;
    modelId?: string;
    variant?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
    messageId?: string;
    partId?: string;
  }): Result.ResultAsync<SessionTab, SendEditorInteractionWhileLockedError> {
    let { session, sessionLockToken } = item;

    try {
      let result = await Result.pipe(
        Result.succeed(item),
        Result.bind(
          'lockedSession',
          (v): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> =>
            this.sessionsService.getSessionByIdCheckExists({
              sessionId: v.session.sessionId
            })
        ),
        Result.andThrough(v =>
          this.validateSessionStatus({ session: v.lockedSession })
        ),
        Result.bind(
          'isCodex',
          (v): Result.Result<boolean, never> =>
            Result.succeed(
              v.interactionType === 'Message'
                ? v.isMessageUsesCodex
                : v.lockedSession.providerId === CODEX_PROVIDER_ID
            )
        ),
        Result.andThrough(async v =>
          v.isCodex
            ? this.codexService.prewarmCodexAuth({
                userId: v.user.userId
              })
            : Result.succeed()
        ),
        Result.bind(
          'freshUser',
          async (v): Result.ResultAsync<UserTab, GetUserCheckExistsError> =>
            v.isCodex
              ? this.usersService.getUserCheckExists({
                  userId: v.user.userId
                })
              : Result.succeed(v.user)
        ),
        Result.bind(
          'preparedSession',
          (v): Result.ResultAsync<SessionTab, PrepareEditorSandboxError> =>
            this.prepareEditorSandbox({
              session: v.lockedSession,
              project: v.project,
              user: v.freshUser,
              isCodex: v.isCodex,
              interactionType: v.interactionType
            })
        ),
        Result.bind(
          'updatedSession',
          (v): Result.ResultAsync<SessionTab, DispatchEditorInteractionError> =>
            this.dispatchEditorInteraction({
              session: v.preparedSession,
              interactionType: v.interactionType,
              message: v.message,
              agent: v.agent,
              providerId: v.providerId,
              modelId: v.modelId,
              variant: v.variant,
              permissionId: v.permissionId,
              reply: v.reply,
              questionId: v.questionId,
              answers: v.answers,
              messageId: v.messageId,
              partId: v.partId
            })
        ),
        Result.andThrough(v => this.saveSession({ session: v.updatedSession })),
        Result.map((v): SessionTab => v.updatedSession)
      );

      return result;
    } finally {
      await this.editorSessionLockService.releaseSessionLock({
        sessionId: session.sessionId,
        token: sessionLockToken
      });
    }
  }

  private async prepareEditorSandbox(item: {
    session: SessionTab;
    project: ProjectTab;
    user: UserTab;
    isCodex: boolean;
    interactionType: InteractionType;
  }): Result.ResultAsync<SessionTab, PrepareEditorSandboxError> {
    let { session, project, user, isCodex, interactionType } = item;

    let sandboxInfo: Awaited<
      ReturnType<EditorSandboxService['getSandboxInfo']>
    > = await this.editorSandboxService.getSandboxInfo({
      sandboxId: session.sandboxId,
      e2bApiKey: project.e2bApiKey
    });

    if (isDefined(sandboxInfo) === true) {
      if (sandboxInfo.state === 'paused') {
        let isLockExist: boolean =
          await this.editorStreamService.publishStopSessionStream({
            sessionId: session.sessionId
          });

        if (isLockExist) {
          await this.editorStreamService.waitForStreamLockRelease({
            sessionId: session.sessionId
          });
        }

        let resumeResult: Result.Result<void, ResumeSandboxError> =
          await this.editorSandboxService.resumeSandbox({
            sandboxType: session.sandboxType,
            sandboxId: session.sandboxId,
            e2bApiKey: project.e2bApiKey,
            timeoutMs:
              this.cs.get<BackendConfig['sandboxTimeoutMinutes']>(
                'sandboxTimeoutMinutes'
              ) * 60_000
          });

        if (Result.isFailure(resumeResult)) {
          return resumeResult;
        }

        sandboxInfo = await this.editorSandboxService.getSandboxInfo({
          sandboxId: session.sandboxId,
          e2bApiKey: project.e2bApiKey
        });
      }

      if (sandboxInfo.state === 'running') {
        if (
          isCodex === true &&
          user.codexAuthUpdateTs !== session.codexAuthUpdateTs
        ) {
          await this.editorCodexService.writeAuthJsonToSandbox({
            sandboxId: session.sandboxId,
            e2bApiKey: project.e2bApiKey,
            codexAuth: user.codexAuth
          });

          session.codexAuthUpdateTs = user.codexAuthUpdateTs;
        }

        if (interactionType === 'Message') {
          let providersResult: Result.Result<
            ProviderTab[],
            GetEnabledProvidersError
          > = await this.providersService.getEnabledProviders({
            projectId: session.projectId
          });

          if (Result.isFailure(providersResult)) {
            return providersResult;
          }

          let providers: ProviderTab[] = providersResult.value;

          let providerConfig: ProviderConfigResult =
            await this.editorOpencodeService.buildProviderConfig({
              providers: providers,
              isUserCodexAuthSet: isDefined(user.codexAuth)
            });

          let isProviderConfigChanged =
            session.providerConfigHash !== providerConfig.hash;

          if (isProviderConfigChanged) {
            let freshSessionResult: Result.Result<
              SessionTab,
              GetSessionByIdCheckExistsError
            > = await this.sessionsService.getSessionByIdCheckExists({
              sessionId: session.sessionId
            });

            if (Result.isFailure(freshSessionResult)) {
              return freshSessionResult;
            }

            let freshSession: SessionTab = freshSessionResult.value;

            session = {
              ...freshSession,
              codexAuthUpdateTs: session.codexAuthUpdateTs
            };

            let isRefreshNeeded =
              freshSession.providerConfigHash !== providerConfig.hash;

            if (isRefreshNeeded) {
              let isLockExist: boolean =
                await this.editorStreamService.publishStopSessionStream({
                  sessionId: session.sessionId
                });

              if (isLockExist) {
                await this.editorStreamService.waitForStreamLockRelease({
                  sessionId: session.sessionId
                });
              }

              let rotationOutput: MakeRotatedSessionCredentialsOutput =
                await this.makeRotatedSessionCredentials({
                  session: session
                });

              // let restartStartTs = Date.now();

              let refreshResult: Result.Result<
                void,
                RestartOpencodeServerError
              > = await customRetry({
                action: async () =>
                  await this.editorOpencodeService.restartOpencodeServer({
                    sessionId: rotationOutput.session.sessionId,
                    sandboxType: rotationOutput.session.sandboxType,
                    sandboxId: rotationOutput.session.sandboxId,
                    e2bApiKey: project.e2bApiKey,
                    sandboxBaseUrl: rotationOutput.session.sandboxBaseUrl,
                    opencodePassword: rotationOutput.session.opencodePassword,
                    sandboxEnvs: {
                      ...providerConfig.envs,
                      OPENCODE_CONFIG_CONTENT: providerConfig.content,
                      MPROVE_CLI_PROJECT_ID: rotationOutput.session.projectId,
                      MPROVE_CLI_HOST: this.cs.get<
                        BackendConfig['sandboxMproveCliHost']
                      >('sandboxMproveCliHost')
                    },
                    sessionApiKey: rotationOutput.sessionApiKey
                  }),
                options: getRetryOption(this.cs, this.logger)
              });

              if (Result.isFailure(refreshResult)) {
                return refreshResult;
              }

              // let restartElapsedMs = Date.now() - restartStartTs;

              // console.log(
              //   `[opencode-refresh] restarted sessionId=${session.sessionId} elapsedMs=${restartElapsedMs}`
              // );

              session = {
                ...rotationOutput.session,
                providerConfigHash: providerConfig.hash
              };

              let saveResult: Result.Result<void, SaveSessionError> =
                await this.saveSession({ session: session });

              if (Result.isFailure(saveResult)) {
                return saveResult;
              }
            }
          }
        }

        let clientResult: Result.Result<
          OpencodeClient,
          GetOpenCodeClientError
        > = await this.editorOpencodeService.getOpenCodeClient({
          sessionId: session.sessionId,
          sandboxBaseUrl: session.sandboxBaseUrl,
          opencodePassword: session.opencodePassword
        });

        if (Result.isFailure(clientResult)) {
          return clientResult;
        }

        let healthResult: Result.Result<void, HealthCheckOpenCodeError> =
          await this.editorOpencodeService.healthCheckOpenCode({
            sandboxBaseUrl: session.sandboxBaseUrl
          });

        if (Result.isFailure(healthResult)) {
          return healthResult;
        }

        session.status = 'Active';

        session.sandboxStartTs = sandboxInfo.startedAt.getTime();

        session.sandboxEndTs = sandboxInfo.endAt.getTime();

        session.sandboxInfo = sandboxInfo;

        session.lastActivityTs = Date.now();
      } else {
        session.status = 'Error';
      }
    } else {
      session.status = 'Archived';

      session.archiveReason = 'Expire';
    }

    return Result.succeed(session);
  }

  private async dispatchEditorInteraction(item: {
    session: SessionTab;
    interactionType: InteractionType;
    message?: string;
    agent?: string;
    providerId?: string;
    modelId?: string;
    variant?: string;
    permissionId?: string;
    reply?: string;
    questionId?: string;
    answers?: string[][];
    messageId?: string;
    partId?: string;
  }): Result.ResultAsync<SessionTab, DispatchEditorInteractionError> {
    let {
      session,
      interactionType,
      message,
      agent,
      providerId,
      modelId,
      variant,
      permissionId,
      reply,
      questionId,
      answers,
      messageId,
      partId
    } = item;

    if (session.status === 'Active') {
      // validate message interaction early
      if (interactionType === 'Message') {
        if (agent === undefined) {
          return Result.fail({ code: 'BACKEND_MESSAGE_AGENT_REQUIRED' });
        }

        if (variant === undefined) {
          return Result.fail({ code: 'BACKEND_MESSAGE_VARIANT_REQUIRED' });
        }
      }

      let streamResult: Result.Result<boolean, StartEventStreamError> =
        await this.editorStreamService.startEventStream({
          sessionId: session.sessionId,
          opencodeSessionId: session.opencodeSessionId,
          isSetReload: false
        });

      if (Result.isFailure(streamResult)) {
        return streamResult;
      }

      let isStreamStartedFresh: boolean = streamResult.value;

      if (isStreamStartedFresh) {
        // this pod holds the stream — execute locally
        let interactionResult: Result.Result<
          ExecuteInteractionOutput,
          ExecuteInteractionError
        >;

        try {
          interactionResult = await this.editorStreamService.executeInteraction(
            {
              sessionId: session.sessionId,
              opencodeSessionId: session.opencodeSessionId,
              interactionType: interactionType,
              message: message,
              agent: agent,
              providerId: providerId,
              modelId: modelId,
              variant: variant,
              permissionId: permissionId,
              reply: reply,
              questionId: questionId,
              answers: answers,
              messageId: messageId,
              partId: partId
            }
          );
        } catch (e) {
          await this.editorStreamService.stopEventStream({
            sessionId: session.sessionId
          });

          await this.editorStreamService.setSessionRequestedReloadTs({
            sessionId: session.sessionId
          });

          throw e;
        }

        if (Result.isFailure(interactionResult)) {
          await this.editorStreamService.stopEventStream({
            sessionId: session.sessionId
          });

          await this.editorStreamService.setSessionRequestedReloadTs({
            sessionId: session.sessionId
          });

          return interactionResult;
        }

        await this.editorStreamService.processEventStream({
          sessionId: session.sessionId
        });
      } else {
        // another pod holds the stream — delegate via pub/sub
        let interactionResult: Result.Result<
          ExecuteInteractionOutput,
          PublishInteractCommandError
        > = await this.editorStreamService.publishInteractCommand({
          sessionId: session.sessionId,
          opencodeSessionId: session.opencodeSessionId,
          interactionType: interactionType,
          message: message,
          agent: agent,
          providerId: providerId,
          modelId: modelId,
          variant: variant,
          permissionId: permissionId,
          reply: reply,
          questionId: questionId,
          answers: answers,
          messageId: messageId,
          partId: partId
        });

        if (Result.isFailure(interactionResult)) {
          return interactionResult;
        }
      }

      if (interactionType === 'Message') {
        session = {
          ...session,
          agent: agent,
          providerId: providerId,
          modelId: modelId,
          lastMessageVariant: variant
        };
      }

      session.lastActivityTs = Date.now();
    }

    return Result.succeed(session);
  }

  private async saveSession(item: {
    session: SessionTab;
  }): Result.ResultAsync<void, SaveSessionError> {
    let { session } = item;

    return dbErrorToResult({
      action: async () => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(
              async tx =>
                await this.db.packer.writeUnwrap({
                  tx: tx,
                  insertOrUpdate: {
                    sessions: [session]
                  }
                })
            ),
          getRetryOption(this.cs, this.logger)
        );
      }
    });
  }

  private async makeRotatedSessionCredentials(item: {
    session: SessionTab;
  }): Promise<MakeRotatedSessionCredentialsOutput> {
    let { session } = item;

    let apiKeyParts: {
      prefix: string;
      secret: string;
      secretHash: string;
      salt: string;
    } = await generateApiKeyParts();

    let sessionApiKey: string = buildSessionApiKey({
      prefix: apiKeyParts.prefix,
      sessionId: session.sessionId,
      secret: apiKeyParts.secret
    });

    let updatedSession: SessionTab = {
      ...session,
      apiKeyPrefix: apiKeyParts.prefix,
      apiKeySecretHash: apiKeyParts.secretHash,
      apiKeySalt: apiKeyParts.salt,
      opencodePassword: crypto.randomBytes(32).toString('hex')
    };

    let output: MakeRotatedSessionCredentialsOutput = {
      session: updatedSession,
      sessionApiKey: sessionApiKey
    };

    return output;
  }

  private validateSessionStatus(item: {
    session: SessionTab;
  }): Result.Result<void, ValidateSessionStatusError> {
    let { session } = item;

    if (session.status === 'New') {
      return Result.fail({ code: 'BACKEND_SESSION_NOT_READY' });
    }

    if (session.status === 'Archived') {
      return Result.fail({ code: 'BACKEND_SESSION_IS_ARCHIVED' });
    }

    if (session.status === 'Deleted') {
      return Result.fail({ code: 'BACKEND_SESSION_NOT_FOUND' });
    }

    if (session.status === 'Error') {
      return Result.fail({ code: 'BACKEND_SESSION_IS_IN_ERROR_STATE' });
    }

    return Result.succeed();
  }
}
