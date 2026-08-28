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
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendSendMessageToEditorSessionRequestDto,
  ToBackendSendMessageToEditorSessionResponseDto
} from '#backend/controllers/sessions/send-message-to-editor-session/send-message-to-editor-session.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProviderTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { CodexService } from '#backend/services/codex.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { UsersService } from '#backend/services/db/users.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex.service';
import {
  EditorOpencodeService,
  type ProviderConfigResult
} from '#backend/services/editor/editor-opencode.service';
import { EditorSandboxService } from '#backend/services/editor/editor-sandbox.service';
import { EditorSessionLockService } from '#backend/services/editor/editor-session-lock.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream.service';
import { CODEX_PROVIDER_ID } from '#common/constants/providers';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ArchiveReasonEnum } from '#common/enums/archive-reason.enum';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendSendMessageToEditorSessionResponsePayload } from '#common/zod/to-backend/sessions/to-backend-send-message-to-editor-session';
import { buildSessionApiKey } from '#node-common/functions/api-key/build-session-api-key';
import { generateApiKeyParts } from '#node-common/functions/api-key/generate-api-key-parts';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendSendMessageToEditorSession)
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
  ) {
    let {
      sessionId,
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
    } = body.payload;

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

    this.validateSessionStatus({ session: session });

    let messageUsesCodex = false;

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
        variant: variant,
        isUserCodexAuthSet: isDefined(user.codexAuth),
        isBuilder: true
      });

      messageUsesCodex =
        modelSelection.provider.type === ProviderTypeEnum.OpenAICodex;
    }

    let sessionLockToken: string =
      await this.editorSessionLockService.acquireSessionLock({
        sessionId: session.sessionId
      });

    try {
      let lockedSession: SessionTab =
        await this.sessionsService.getSessionByIdCheckExists({
          sessionId: session.sessionId
        });

      session = lockedSession;

      this.validateSessionStatus({ session: session });

      let isCodex =
        interactionType === InteractionTypeEnum.Message
          ? messageUsesCodex
          : session.providerId === CODEX_PROVIDER_ID;

      if (isCodex === true) {
        await this.codexService.prewarmCodexAuth({
          userId: user.userId
        });

        user = await this.usersService.getUserCheckExists({
          userId: user.userId
        });
      }

      let sandboxInfo = await this.editorSandboxService.getSandboxInfo({
        sandboxId: session.sandboxId,
        e2bApiKey: project.e2bApiKey
      });

      if (isDefined(sandboxInfo) === true) {
        if (sandboxInfo.state === 'paused') {
          let isLockExist =
            await this.editorStreamService.publishStopSessionStream({
              sessionId: session.sessionId
            });

          if (isLockExist) {
            await this.editorStreamService.waitForStreamLockRelease({
              sessionId: session.sessionId
            });
          }

          await this.editorSandboxService.resumeSandbox({
            sandboxType: session.sandboxType as SandboxTypeEnum,
            sandboxId: session.sandboxId,
            e2bApiKey: project.e2bApiKey,
            timeoutMs:
              this.cs.get<BackendConfig['sandboxTimeoutMinutes']>(
                'sandboxTimeoutMinutes'
              ) * 60_000
          });

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

          if (interactionType === InteractionTypeEnum.Message) {
            let providers: ProviderTab[] =
              await this.providersService.getEnabledProviders({
                projectId: session.projectId
              });

            let providerConfig: ProviderConfigResult =
              await this.editorOpencodeService.buildProviderConfig({
                providers: providers,
                isUserCodexAuthSet: isDefined(user.codexAuth)
              });

            let isProviderConfigChanged =
              session.providerConfigHash !== providerConfig.hash;

            if (isProviderConfigChanged) {
              let freshSession: SessionTab =
                await this.sessionsService.getSessionByIdCheckExists({
                  sessionId: session.sessionId
                });

              session = {
                ...freshSession,
                codexAuthUpdateTs: session.codexAuthUpdateTs
              };

              let shouldRefresh =
                freshSession.providerConfigHash !== providerConfig.hash;

              if (shouldRefresh) {
                let isLockExist: boolean =
                  await this.editorStreamService.publishStopSessionStream({
                    sessionId: session.sessionId
                  });

                if (isLockExist) {
                  await this.editorStreamService.waitForStreamLockRelease({
                    sessionId: session.sessionId
                  });
                }

                let rotationResult: {
                  session: SessionTab;
                  sessionApiKey: string;
                } = await this.makeRotatedSessionCredentials({
                  session: session
                });

                // let restartStartTs = Date.now();

                await retry(
                  async () =>
                    await this.editorOpencodeService.restartOpencodeServer({
                      sessionId: rotationResult.session.sessionId,
                      sandboxType: rotationResult.session
                        .sandboxType as SandboxTypeEnum,
                      sandboxId: rotationResult.session.sandboxId,
                      e2bApiKey: project.e2bApiKey,
                      sandboxBaseUrl: rotationResult.session.sandboxBaseUrl,
                      opencodePassword: rotationResult.session.opencodePassword,
                      sandboxEnvs: {
                        ...providerConfig.envs,
                        OPENCODE_CONFIG_CONTENT: providerConfig.content,
                        MPROVE_CLI_PROJECT_ID: rotationResult.session.projectId,
                        MPROVE_CLI_HOST: this.cs.get<
                          BackendConfig['sandboxMproveCliHost']
                        >('sandboxMproveCliHost')
                      },
                      sessionApiKey: rotationResult.sessionApiKey
                    }),
                  getRetryOption(this.cs, this.logger)
                );

                // let restartElapsedMs = Date.now() - restartStartTs;

                // console.log(
                //   `[opencode-refresh] restarted sessionId=${session.sessionId} elapsedMs=${restartElapsedMs}`
                // );

                session = {
                  ...rotationResult.session,
                  providerConfigHash: providerConfig.hash
                };

                await this.saveSession({ session: session });
              }
            }
          }

          await this.editorOpencodeService.getOpenCodeClient({
            sessionId: session.sessionId,
            sandboxBaseUrl: session.sandboxBaseUrl,
            opencodePassword: session.opencodePassword
          });

          await this.editorOpencodeService.healthCheckOpenCode({
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
              message: ErEnum.BACKEND_MESSAGE_AGENT_REQUIRED
            });
          }

          if (variant === undefined) {
            throw new ServerError({
              message: ErEnum.BACKEND_MESSAGE_VARIANT_REQUIRED
            });
          }
        }

        let isStreamStartedFresh =
          await this.editorStreamService.startEventStream({
            sessionId: session.sessionId,
            opencodeSessionId: session.opencodeSessionId,
            isSetReload: false
          });

        if (isStreamStartedFresh) {
          // this pod holds the stream — execute locally
          try {
            await this.editorStreamService.executeInteraction({
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
          } catch (e) {
            await this.editorStreamService.stopEventStream({
              sessionId: session.sessionId
            });

            await this.editorStreamService.setSessionRequestedReloadTs({
              sessionId: session.sessionId
            });

            throw e;
          }

          await this.editorStreamService.processEventStream({
            sessionId: session.sessionId
          });
        } else {
          // another pod holds the stream — delegate via pub/sub
          await this.editorStreamService.publishInteractCommand({
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
        }

        if (interactionType === InteractionTypeEnum.Message) {
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

      await this.saveSession({ session: session });
    } finally {
      await this.editorSessionLockService.releaseSessionLock({
        sessionId: session.sessionId,
        token: sessionLockToken
      });
    }

    let ocSession = await this.sessionsService.getOcSessionBySessionId({
      sessionId: session.sessionId
    });

    let sessionApi = this.sessionsService.tabToSessionApi({
      session: session,
      ocSession: ocSession
    });

    let payload: ToBackendSendMessageToEditorSessionResponsePayload = {
      session: sessionApi
    };

    return payload;
  }

  private async saveSession(item: { session: SessionTab }): Promise<void> {
    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insertOrUpdate: {
                sessions: [item.session]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );
  }

  private async makeRotatedSessionCredentials(item: {
    session: SessionTab;
  }): Promise<{ session: SessionTab; sessionApiKey: string }> {
    let apiKeyParts: {
      prefix: string;
      secret: string;
      secretHash: string;
      salt: string;
    } = await generateApiKeyParts();

    let sessionApiKey: string = buildSessionApiKey({
      prefix: apiKeyParts.prefix,
      sessionId: item.session.sessionId,
      secret: apiKeyParts.secret
    });

    let updatedSession: SessionTab = {
      ...item.session,
      apiKeyPrefix: apiKeyParts.prefix,
      apiKeySecretHash: apiKeyParts.secretHash,
      apiKeySalt: apiKeyParts.salt,
      opencodePassword: crypto.randomBytes(32).toString('hex')
    };

    let result: { session: SessionTab; sessionApiKey: string } = {
      session: updatedSession,
      sessionApiKey: sessionApiKey
    };

    return result;
  }

  private validateSessionStatus(item: { session: SessionTab }): void {
    if (item.session.status === SessionStatusEnum.New) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_NOT_READY
      });
    }

    if (item.session.status === SessionStatusEnum.Archived) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_IS_ARCHIVED
      });
    }

    if (item.session.status === SessionStatusEnum.Deleted) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_NOT_FOUND
      });
    }

    if (item.session.status === SessionStatusEnum.Error) {
      throw new ServerError({
        message: ErEnum.BACKEND_SESSION_IS_IN_ERROR_STATE
      });
    }
  }
}
