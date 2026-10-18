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
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendCreateEditorSessionRequestDto,
  ToBackendCreateEditorSessionResponseDto
} from '#backend/controllers/sessions/create-editor-session/create-editor-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BranchTab,
  BridgeTab,
  OcSessionTab,
  ProjectTab,
  ProviderTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { BranchEnt } from '#backend/drizzle/postgres/schema/branches';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import type { BridgeEnt } from '#backend/drizzle/postgres/schema/bridges';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { buildSessionApiKey } from '#backend/functions/api-key/build-session-api-key/build-session-api-key';
import { generateApiKeyParts } from '#backend/functions/api-key/generate-api-key-parts/generate-api-key-parts';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeSessionId } from '#backend/functions/make-session-id/make-session-id';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import {
  BlockmlService,
  type RebuildStructOutput
} from '#backend/services/blockml/blockml.service';
import { CodexService } from '#backend/services/codex/codex.service';
import { BranchesService } from '#backend/services/db/branches/branches.service';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { GetModelSelectionOutput } from '#backend/services/db/providers/providers.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex/editor-codex.service';
import { EditorConnectionsService } from '#backend/services/editor/editor-connections/editor-connections.service';
import type { ProviderConfigResult } from '#backend/services/editor/editor-opencode/editor-opencode.service';
import { EditorOpencodeService } from '#backend/services/editor/editor-opencode/editor-opencode.service';
import type { ExecuteInteractionOutput } from '#backend/services/editor/editor-stream/editor-stream.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream/editor-stream.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { ServerError } from '#common/classes/server-error/server-error';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { CreateSessionRepoError } from '#common/types/backend/function-errors/create-session-repo-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { ExecuteInteractionError } from '#common/types/backend/function-errors/execute-interaction-error';
import type { GetEnabledProvidersError } from '#common/types/backend/function-errors/get-enabled-providers-error';
import type { GetModelSelectionError } from '#common/types/backend/function-errors/get-model-selection-error';
import type { GetOpenCodeClientError } from '#common/types/backend/function-errors/get-open-code-client-error';
import type { GetProjectCheckExistsError } from '#common/types/backend/function-errors/get-project-check-exists-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { GetUserCheckExistsError } from '#common/types/backend/function-errors/get-user-check-exists-error';
import type { RebuildStructError } from '#common/types/backend/function-errors/rebuild-struct-error';
import type { SendToDiskError } from '#common/types/backend/function-errors/send-to-disk-error';
import type { SessionEntToTabError } from '#common/types/backend/function-errors/session-ent-to-tab-error';
import type { StartEventStreamError } from '#common/types/backend/function-errors/start-event-stream-error';
import type { BaseProject } from '#common/types/backend/parts/project/base-project';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateEditorSessionOutput } from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-output';
import type { ToDiskCreateDevRepoOutput } from '#common/types/disk/routes/repos/create-dev-repo/create-dev-repo-output';

type CreateEditorSessionRecordPayload = {
  session: SessionTab;
  apiKeyParts: {
    prefix: string;
    secret: string;
    secretHash: string;
    salt: string;
  };
};

type CreateSessionRepoOutput = { repoId: string; branchId: string };

type SandboxFile = { path: string; data: string };

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateEditorSessionController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private providersService: ProvidersService,
    private usersService: UsersService,
    private editorStreamService: EditorStreamService,
    private editorOpencodeService: EditorOpencodeService,
    private editorCodexService: EditorCodexService,
    private codexService: CodexService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private editorConnectionsService: EditorConnectionsService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendCreateEditorSession' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateEditorSession',
    description: 'Create a new editor session'
  })
  @ApiOkResponse({
    type: ToBackendCreateEditorSessionResponseDto
  })
  async createEditorSession(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateEditorSessionRequestDto
  ): Promise<BackendResultForOperation<'createEditorSession'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        sandboxType: body.input.sandboxType,
        providerId: body.input.providerId,
        modelId: body.input.modelId,
        agent: body.input.agent,
        variant: body.input.variant,
        envId: body.input.envId,
        initialBranch: body.input.initialBranch,
        firstMessage: body.input.firstMessage,
        messageId: body.input.messageId,
        partId: body.input.partId,
        traceId: body.traceId,
        user: user
      }),
      Result.bind(
        'project',
        (v): Result.ResultAsync<ProjectTab, GetProjectCheckExistsError> =>
          this.projectsService.getProjectCheckExists({
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsEditor({
          memberId: v.user.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'maxActiveEditorSessionsPerProjectUser',
        (v): Result.Result<number, never> =>
          Result.succeed(
            this.cs.get<BackendConfig['maxActiveEditorSessionsPerProjectUser']>(
              'maxActiveEditorSessionsPerProjectUser'
            )
          )
      ),
      Result.bind(
        'activeSessions',
        (v): Result.ResultAsync<SessionTab[], SessionEntToTabError> =>
          this.db.drizzle.query.sessionsTable
            .findMany({
              where: and(
                eq(sessionsTable.userId, v.user.userId),
                eq(sessionsTable.type, 'Editor'),
                inArray(sessionsTable.status, ['Active', 'New'])
              )
            })
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.sessionEntToTab({ sessionEnt: x })
              )
            )
      ),
      Result.andThrough(v =>
        v.activeSessions.length >= v.maxActiveEditorSessionsPerProjectUser
          ? Result.fail({ code: 'BACKEND_TOO_MANY_ACTIVE_EDITOR_SESSIONS' })
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
          this.providersService.getModelSelection({
            projectId: v.projectId,
            providerId: v.providerId,
            modelId: v.modelId,
            variant: v.variant,
            isUserCodexAuthSet: isDefined(v.user.codexAuth),
            isBuilder: true
          })
      ),
      Result.andThrough(async v =>
        v.modelSelection.provider.type === 'OpenAICodex'
          ? this.codexService.prewarmCodexAuth({ userId: v.user.userId })
          : Result.succeed()
      ),
      Result.bind(
        'freshUser',
        async (v): Result.ResultAsync<UserTab, GetUserCheckExistsError> =>
          v.modelSelection.provider.type === 'OpenAICodex'
            ? this.usersService.getUserCheckExists({
                userId: v.user.userId
              })
            : Result.succeed(v.user)
      ),
      // Type Editor: existing sandboxed opencode flow
      Result.bind(
        'providers',
        (v): Result.ResultAsync<ProviderTab[], GetEnabledProvidersError> =>
          this.providersService.getEnabledProviders({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'providerConfig',
        async (v): Result.ResultAsync<ProviderConfigResult, never> => {
          let providerConfig: ProviderConfigResult =
            await this.editorOpencodeService.buildProviderConfig({
              providers: v.providers,
              isUserCodexAuthSet: isDefined(v.freshUser.codexAuth)
            });
          return Result.succeed(providerConfig);
        }
      ),
      Result.bind(
        'sandboxEnvs',
        (v): Result.Result<Record<string, string>, never> =>
          Result.succeed({
            ...v.providerConfig.envs,
            OPENCODE_CONFIG_CONTENT: v.providerConfig.content
          })
      ),
      // Phase 1: Save session with status=New and return immediately
      Result.bind(
        'createEditorSessionRecordPayload',
        async (
          v
        ): Result.ResultAsync<
          CreateEditorSessionRecordPayload,
          DbErrorToError
        > => {
          let now: number = Date.now();

          let session: SessionTab;

          let apiKeyParts: Awaited<ReturnType<typeof generateApiKeyParts>>;

          let persistenceResult: Result.Result<void, DbErrorToError> =
            await dbErrorToResult({
              action: async () => {
                await retry(
                  async () => {
                    apiKeyParts = await generateApiKeyParts();

                    let sessionId: string = makeSessionId();

                    session = this.sessionsService.makeSession({
                      sessionId: sessionId,
                      type: 'Editor',
                      repoId: sessionId,
                      branchId: sessionId,
                      userId: v.freshUser.userId,
                      projectId: v.projectId,
                      sandboxType: v.sandboxType,
                      providerId: v.providerId,
                      modelId: v.modelId,
                      lastMessageVariant: v.variant,
                      agent: v.agent,
                      firstMessage: v.firstMessage,
                      apiKeyPrefix: apiKeyParts.prefix,
                      apiKeySecretHash: apiKeyParts.secretHash,
                      apiKeySalt: apiKeyParts.salt,
                      providerConfigHash: v.providerConfig.hash,
                      initialBranch: v.initialBranch,
                      envId: v.envId,
                      initialCommit: undefined,
                      codexAuthUpdateTs:
                        v.modelSelection.provider.type === 'OpenAICodex'
                          ? v.freshUser.codexAuthUpdateTs
                          : undefined,
                      status: 'New',
                      lastActivityTs: now,
                      createdTs: now
                    });

                    let ocSession: OcSessionTab =
                      this.sessionsService.makeOcSession({
                        sessionId: sessionId
                      });

                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.writeUnwrap({
                          tx: tx,
                          insert: {
                            sessions: [session],
                            ocSessions: [ocSession]
                          }
                        })
                    );
                  },
                  getRetryOption(this.cs, this.logger)
                );
              }
            });

          return Result.isFailure(persistenceResult)
            ? persistenceResult
            : Result.succeed({ session: session, apiKeyParts: apiKeyParts });
        }
      ),
      // Phase 2: Activate session asynchronously (fire-and-forget)
      Result.map(v => {
        v.sandboxEnvs.MPROVE_CLI_API_KEY = buildSessionApiKey({
          prefix: v.createEditorSessionRecordPayload.apiKeyParts.prefix,
          sessionId: v.createEditorSessionRecordPayload.session.sessionId,
          secret: v.createEditorSessionRecordPayload.apiKeyParts.secret
        });

        v.sandboxEnvs.MPROVE_CLI_PROJECT_ID = v.projectId;

        v.sandboxEnvs.MPROVE_CLI_HOST = this.cs.get<
          BackendConfig['sandboxMproveCliHost']
        >('sandboxMproveCliHost');
        return v;
      }),
      // Malloy CLI files remain disabled in the sandbox, but preparation is still awaited.
      Result.andThrough(v =>
        this.editorConnectionsService.getMalloySandboxEnvsAndFiles({
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      // disabled malloy-cli in sandbox
      // Object.assign(sandboxEnvs, malloyConnectionEnvs);
      Result.bind('sandboxFiles', (v): Result.Result<SandboxFile[], never> => {
        let sessionDataFile: SandboxFile = {
          path: '/home/user/.config/opencode/mprove-session.json',
          data: JSON.stringify(
            {
              projectId: v.projectId,
              repoId: v.createEditorSessionRecordPayload.session.sessionId,
              branchId: v.createEditorSessionRecordPayload.session.sessionId,
              envId: v.envId,
              note: 'For mprove cli - no need to specify projectId, because it is already set in MPROVE_CLI_PROJECT_ID env var'
            },
            null,
            2
          )
        };

        let isCodexProviderEnabled: boolean = v.providers.some(
          provider => provider.type === 'OpenAICodex'
        );

        let codexAuthFile: SandboxFile;

        if (isCodexProviderEnabled && isDefined(v.freshUser.codexAuth)) {
          codexAuthFile = this.editorCodexService.buildCodexAuthFile({
            codexAuth: v.freshUser.codexAuth
          });
        }

        return Result.succeed(
          codexAuthFile
            ? [
                // ...malloySandboxFiles,  // disabled malloy-cli in sandbox
                sessionDataFile,
                codexAuthFile
              ]
            : [
                // ...malloySandboxFiles, // disabled malloy-cli in sandbox
                sessionDataFile
              ]
        );
      }),
      Result.andThrough(v => {
        void this.activateSessionAsync({
          sessionId: v.createEditorSessionRecordPayload.session.sessionId,
          projectId: v.projectId,
          envId: v.envId,
          providerId: v.createEditorSessionRecordPayload.session.providerId,
          modelId: v.createEditorSessionRecordPayload.session.modelId,
          agent: v.createEditorSessionRecordPayload.session.agent,
          sandboxType: v.sandboxType,
          sandboxEnvs: v.sandboxEnvs,
          sandboxFiles: v.sandboxFiles,
          project: v.project,
          variant: v.variant,
          firstMessage: v.firstMessage,
          messageId: v.messageId,
          partId: v.partId
        }).catch(e => {
          logToConsoleBackend({
            log: e,
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
        });
        return Result.succeed();
      }),
      // Phase 3: Create session repo (awaited)
      Result.bind(
        'createSessionRepoOutput',
        (
          v
        ): Result.ResultAsync<
          CreateSessionRepoOutput,
          CreateSessionRepoError
        > =>
          this.createSessionRepo({
            session: v.createEditorSessionRecordPayload.session,
            project: v.project,
            envId: v.envId,
            initialBranch: v.initialBranch,
            traceId: v.traceId
          })
      ),
      // console.log(
      //   `createSessionRepoAsync took ${(Date.now() - createSessionRepoStart) / 1000}s`
      // );
      Result.map(
        (v): ToBackendCreateEditorSessionOutput => ({
          sessionId: v.createEditorSessionRecordPayload.session.sessionId,
          repoId: v.createSessionRepoOutput.repoId,
          branchId: v.createSessionRepoOutput.branchId,
          envId: v.createEditorSessionRecordPayload.session.envId
        })
      )
    );
  }

  private async activateSessionAsync(item: {
    sessionId: string;
    projectId: string;
    envId: string;
    providerId: string;
    modelId: string;
    agent?: string;
    sandboxType: SandboxType;
    sandboxEnvs: Record<string, string>;
    sandboxFiles: { path: string; data: string }[];
    project: any;
    variant?: string;
    firstMessage?: string;
    messageId: string;
    partId: string;
  }) {
    let {
      sessionId,
      projectId,
      envId,
      providerId,
      modelId,
      agent,
      sandboxType,
      sandboxEnvs,
      sandboxFiles,
      project,
      variant,
      firstMessage,
      messageId,
      partId
    } = item;

    try {
      let sandboxTimeoutMinutes = this.cs.get<
        BackendConfig['sandboxTimeoutMinutes']
      >('sandboxTimeoutMinutes');

      let sandboxTimeoutMs = sandboxTimeoutMinutes * 60 * 1000;

      // console.log('starting opencode server...');

      let { sandboxId, sandboxBaseUrl, opencodePassword, sandboxInfo } =
        await this.editorOpencodeService.startOpencodeServer({
          sandboxType: sandboxType,
          sandboxTimeoutMs: sandboxTimeoutMs,
          sandboxEnvs: sandboxEnvs,
          sandboxFiles: sandboxFiles,
          project: project,
          sessionBranch: sessionId
        });

      // console.log('opencode server started');

      let opencodeClientResult: Result.Result<
        OpencodeClient,
        GetOpenCodeClientError
      > = await this.editorOpencodeService.getOpenCodeClient({
        sessionId: sessionId,
        sandboxBaseUrl: sandboxBaseUrl,
        opencodePassword: opencodePassword
      });

      if (Result.isFailure(opencodeClientResult)) {
        throw new ServerError({
          message: opencodeClientResult.error.code
        });
      }

      let opencodeClient: OpencodeClient = opencodeClientResult.value;

      let { data: opencodeSession } = await opencodeClient.session
        .create({}, { throwOnError: true })
        .catch(e => {
          throw new ServerError({
            message: 'BACKEND_CREATE_SESSION_FAILED',
            originalError: e
          });
        });

      let opencodeSessionId = opencodeSession.id;

      let now = Date.now();

      let currentSession: SessionTab;
      let retryMs = 20_000;
      let intervalMs = 1_000;
      let start = Date.now();

      while (true) {
        let currentSessionResult: Result.Result<
          SessionTab,
          GetSessionByIdCheckExistsError
        > = await this.sessionsService.getSessionByIdCheckExists({
          sessionId: sessionId
        });

        if (Result.isFailure(currentSessionResult)) {
          throw new ServerError({
            message: currentSessionResult.error.code
          });
        }

        currentSession = currentSessionResult.value;
        if (currentSession.initialCommit) break;
        if (Date.now() - start >= retryMs) {
          await this.db.drizzle.execute(
            sql`UPDATE sessions SET status = ${'Error' satisfies SessionStatus} WHERE session_id = ${sessionId}`
          );
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_FAILED_TO_GET_INITIAL_COMMIT'
            }),
            logLevel: 'Error',
            logger: this.logger,
            cs: this.cs
          });
          return;
        }
        await new Promise(r => setTimeout(r, intervalMs));
      }

      let updatedSession: SessionTab = {
        ...currentSession,
        sandboxId: sandboxId,
        sandboxBaseUrl: sandboxBaseUrl,
        opencodeSessionId: opencodeSessionId,
        opencodePassword: opencodePassword,
        status: 'Active',
        lastActivityTs: now,
        sandboxStartTs: sandboxInfo.startedAt.getTime(),
        sandboxEndTs: sandboxInfo.endAt.getTime(),
        sandboxInfo: sandboxInfo
      };

      let updatedOcSession: OcSessionTab = {
        sessionId: sessionId,
        openSession: opencodeSession,
        serverTs: undefined,
        keyTag: undefined
      };

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.writeUnwrap({
                tx: tx,
                insertOrUpdate: {
                  sessions: [updatedSession],
                  ocSessions: [updatedOcSession]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );

      let startEventStream: Result.Result<boolean, StartEventStreamError> =
        await this.editorStreamService.startEventStream({
          sessionId: sessionId,
          opencodeSessionId: opencodeSessionId,
          isSetReload: false
        });

      if (Result.isFailure(startEventStream)) {
        throw new ServerError({
          message: startEventStream.error.code
        });
      }

      let isStreamStartedFresh: boolean = startEventStream.value;

      if (firstMessage) {
        // system prompt now handled via opencode instructions mechanism
        // (see mprove-instructions.md and mprove-session.json)

        try {
          let executeInteractionOutput: Result.Result<
            ExecuteInteractionOutput,
            ExecuteInteractionError
          > = await this.editorStreamService.executeInteraction({
            sessionId: sessionId,
            opencodeSessionId: opencodeSessionId,
            interactionType: 'Message',
            message: firstMessage,
            agent: agent,
            providerId: providerId,
            modelId: modelId,
            variant: variant,
            messageId: messageId,
            partId: partId
          });

          if (Result.isFailure(executeInteractionOutput)) {
            throw new ServerError({
              message: executeInteractionOutput.error.code
            });
          }
        } catch (e) {
          if (isStreamStartedFresh) {
            await this.editorStreamService.stopEventStream({
              sessionId: sessionId
            });

            await this.editorStreamService.setSessionRequestedReloadTs({
              sessionId: sessionId
            });
          }

          throw e;
        }
      }

      if (isStreamStartedFresh) {
        await this.editorStreamService.processEventStream({
          sessionId: sessionId
        });
      }
    } catch (e: any) {
      logToConsoleBackend({
        log: e,
        logLevel: 'Error',
        logger: this.logger,
        cs: this.cs
      });

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.writeUnwrap({
                tx: tx,
                rawQueries: [
                  sql`UPDATE sessions SET status = ${'Error' satisfies SessionStatus} WHERE session_id = ${sessionId}`
                ]
              })
          ),
        getRetryOption(this.cs, this.logger)
      ).catch(retryErr => {
        logToConsoleBackend({
          log: retryErr,
          logLevel: 'Error',
          logger: this.logger,
          cs: this.cs
        });
      });

      throw e;
    }
  }

  private async createSessionRepo(item: {
    session: SessionTab;
    project: ProjectTab;
    envId: string;
    initialBranch: string;
    traceId: string;
  }): Result.ResultAsync<CreateSessionRepoOutput, CreateSessionRepoError> {
    return Result.pipe(
      Result.succeed({
        ...item,
        sessionId: item.session.sessionId,
        projectId: item.session.projectId
      }),
      Result.bind(
        'baseProject',
        (v): Result.Result<BaseProject, never> =>
          Result.succeed(
            this.tabService.projectTabToBaseProject({ project: v.project })
          )
      ),
      // let sendToDiskStart = Date.now();
      Result.bind(
        'diskCreateDevRepoOutput',
        (v): Result.ResultAsync<ToDiskCreateDevRepoOutput, SendToDiskError> =>
          this.rpcService.sendToDisk({
            request: {
              operation: 'createDevRepo',
              traceId: v.traceId,
              input: {
                baseProject: v.baseProject,
                devRepoId: v.sessionId,
                initialBranch: v.initialBranch,
                sessionBranch: v.sessionId
              }
            }
          })
      ),
      // console.log(`sendToDisk took ${(Date.now() - sendToDiskStart) / 1000}s`);
      Result.bind(
        'prodBranchEnt',
        (v): Result.ResultAsync<BranchEnt, never> =>
          this.db.drizzle.query.branchesTable
            .findFirst({
              where: and(
                eq(branchesTable.projectId, v.projectId),
                eq(branchesTable.repoId, PROD_REPO_ID),
                eq(branchesTable.branchId, v.project.defaultBranch)
              )
            })
            .then(branchEnt => Result.succeed(branchEnt))
      ),
      Result.bind(
        'sessionBranch',
        (v): Result.Result<BranchTab, never> =>
          Result.succeed(
            this.branchesService.makeBranch({
              projectId: v.projectId,
              repoId: v.sessionId,
              branchId: v.sessionId
            })
          )
      ),
      Result.bind(
        'prodBranchBridgeEnts',
        (v): Result.ResultAsync<BridgeEnt[], never> =>
          this.db.drizzle.query.bridgesTable
            .findMany({
              where: and(
                eq(bridgesTable.projectId, v.prodBranchEnt.projectId),
                eq(bridgesTable.repoId, v.prodBranchEnt.repoId),
                eq(bridgesTable.branchId, v.prodBranchEnt.branchId)
              )
            })
            .then(bridgeEnts => Result.succeed(bridgeEnts))
      ),
      Result.bind(
        'sessionBranchBridges',
        (v): Result.Result<BridgeTab[], never> =>
          Result.succeed(
            v.prodBranchBridgeEnts.map(bridgeEnt =>
              this.bridgesService.makeBridge({
                projectId: v.sessionBranch.projectId,
                repoId: v.sessionBranch.repoId,
                branchId: v.sessionBranch.branchId,
                envId: bridgeEnt.envId,
                structId: EMPTY_STRUCT_ID,
                needValidate: true
              })
            )
          )
      ),
      Result.andThrough(v =>
        Result.sequence(v.sessionBranchBridges, async bridge => {
          if (bridge.envId === v.envId) {
            let structId: string = makeId();

            let rebuildStructOutput: Result.Result<
              RebuildStructOutput,
              RebuildStructError
            > = await this.blockmlService.rebuildStruct({
              traceId: v.traceId,
              orgId: v.project.orgId,
              projectId: v.projectId,
              repoId: v.sessionId,
              structId: structId,
              diskFiles: v.diskCreateDevRepoOutput.files,
              mproveDir: v.diskCreateDevRepoOutput.mproveDir,
              envId: bridge.envId,
              selectedGivens: [],
              overrideTimezone: undefined
            });

            // console.log(
            //   `rebuildStruct took ${(Date.now() - rebuildStructStart) / 1000}s`
            // );

            if (Result.isFailure(rebuildStructOutput)) {
              return rebuildStructOutput;
            }

            bridge.structId = structId;
            bridge.needValidate = false;
          } else {
            bridge.structId = EMPTY_STRUCT_ID;
            bridge.needValidate = true;
          }

          return Result.succeed(bridge);
        })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.writeUnwrap({
                      tx: tx,
                      insert: {
                        branches: [v.sessionBranch],
                        bridges: [...v.sessionBranchBridges]
                      },
                      rawQueries: [
                        sql`UPDATE sessions SET initial_commit = ${v.diskCreateDevRepoOutput.initialCommitHash} WHERE session_id = ${v.sessionId}`
                      ]
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map(
        (v): CreateSessionRepoOutput => ({
          repoId: v.sessionId,
          branchId: v.sessionId
        })
      )
    );
  }
}
