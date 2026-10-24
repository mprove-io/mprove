import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq, inArray, sql } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendCreateEditorSessionRequestDto,
  ToBackendCreateEditorSessionResponseDto
} from '#backend/controllers/sessions/create-editor-session/create-editor-session.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  OcSessionTab,
  ProjectTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { buildSessionApiKey } from '#backend/functions/api-key/build-session-api-key/build-session-api-key';
import { generateApiKeyParts } from '#backend/functions/api-key/generate-api-key-parts/generate-api-key-parts';
import { rebuildBranchBridges } from '#backend/functions/blockml/rebuild-branch-bridges/rebuild-branch-bridges';
import { prewarmCodexAuth } from '#backend/functions/codex/prewarm-codex-auth/prewarm-codex-auth';
import { makeBranch } from '#backend/functions/db/branches/make-branch/make-branch';
import { makeBridge } from '#backend/functions/db/bridges/make-bridge/make-bridge';
import { getMemberCheckIsEditor } from '#backend/functions/db/members/get-member-check-is-editor/get-member-check-is-editor';
import { getModelSelection } from '#backend/functions/db/providers/get-model-selection/get-model-selection';
import { makeOcSession } from '#backend/functions/db/sessions/make-oc-session/make-oc-session';
import { makeSession } from '#backend/functions/db/sessions/make-session/make-session';
import { getUserCheckExists } from '#backend/functions/db/users/get-user-check-exists/get-user-check-exists';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeSessionId } from '#backend/functions/make-session-id/make-session-id';
import { projectTabToBaseProject } from '#backend/functions/project-tab-to-base-project/project-tab-to-base-project';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex/editor-codex.service';
import { EditorConnectionsService } from '#backend/services/editor/editor-connections/editor-connections.service';
import {
  EditorOpencodeService,
  type ProviderConfigResult
} from '#backend/services/editor/editor-opencode/editor-opencode.service';
import {
  EditorStreamService,
  type ExecuteInteractionOutput
} from '#backend/services/editor/editor-stream/editor-stream.service';
import { RpcService } from '#backend/services/rpc/rpc.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { ServerError } from '#common/classes/server-error/server-error';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { CreateSessionRepoError } from '#common/types/backend/function-errors/create-session-repo-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db/db-error-to-error';
import type { ExecuteInteractionError } from '#common/types/backend/function-errors/execute-interaction-error';
import type { GetOpenCodeClientError } from '#common/types/backend/function-errors/get-open-code-client-error';
import type { StartEventStreamError } from '#common/types/backend/function-errors/start-event-stream-error';
import type { SandboxType } from '#common/types/backend/parts/session/sandbox-type';
import type { SessionStatus } from '#common/types/backend/parts/session/session-status';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateEditorSessionOutput } from '#common/types/backend/routes/sessions/create-editor-session/create-editor-session-output';

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
    private tabService: TabService,
    private editorStreamService: EditorStreamService,
    private editorOpencodeService: EditorOpencodeService,
    private editorCodexService: EditorCodexService,
    private rpcService: RpcService,
    private editorConnectionsService: EditorConnectionsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
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
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsEditor({
          memberId: v.user.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('maxActiveEditorSessionsPerProjectUser', v =>
        Result.succeed(
          this.cs.get<BackendConfig['maxActiveEditorSessionsPerProjectUser']>(
            'maxActiveEditorSessionsPerProjectUser'
          )
        )
      ),
      Result.bind('activeSessions', v =>
        this.db.sessions.findMany({
          where: and(
            eq(sessionsTable.userId, v.user.userId),
            eq(sessionsTable.type, 'Editor'),
            inArray(sessionsTable.status, ['Active', 'New'])
          )
        })
      ),
      Result.andThrough(v =>
        v.activeSessions.length >= v.maxActiveEditorSessionsPerProjectUser
          ? Result.fail({ code: 'BACKEND_TOO_MANY_ACTIVE_EDITOR_SESSIONS' })
          : Result.succeed()
      ),
      Result.bind('modelSelection', v =>
        getModelSelection({
          projectId: v.projectId,
          providerId: v.providerId,
          modelId: v.modelId,
          variant: v.variant,
          isUserCodexAuthSet: isDefined(v.user.codexAuth),
          isBuilder: true,
          db: this.db
        })
      ),
      Result.andThrough(async v =>
        v.modelSelection.provider.type === 'OpenAICodex'
          ? prewarmCodexAuth({
              userId: v.user.userId,
              db: this.db
            })
          : Result.succeed()
      ),
      Result.bind('freshUser', async v =>
        v.modelSelection.provider.type === 'OpenAICodex'
          ? getUserCheckExists({
              userId: v.user.userId,
              db: this.db
            })
          : Result.succeed(v.user)
      ),
      // Type Editor: existing sandboxed opencode flow
      Result.bind('providers', v =>
        this.db.providers.findMany({
          where: and(
            eq(providersTable.projectId, v.projectId),
            eq(providersTable.isEnabled, true)
          )
        })
      ),
      Result.bind('providerConfig', async v => {
        let providerConfig: ProviderConfigResult =
          await this.editorOpencodeService.buildProviderConfig({
            providers: v.providers,
            isUserCodexAuthSet: isDefined(v.freshUser.codexAuth)
          });
        return Result.succeed(providerConfig);
      }),
      Result.bind('sandboxEnvs', v => {
        let sandboxEnvs: Record<string, string> = {
          ...v.providerConfig.envs,
          OPENCODE_CONFIG_CONTENT: v.providerConfig.content
        };

        return Result.succeed(sandboxEnvs);
      }),
      // Phase 1: Save session with status=New and return immediately
      Result.bind('createEditorSessionRecordPayload', async v => {
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

                  session = makeSession({
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

                  let ocSession: OcSessionTab = makeOcSession({
                    sessionId: sessionId
                  });

                  await this.db.writeUnwrap({
                    insert: {
                      sessions: [session],
                      ocSessions: [ocSession]
                    },
                    retryOptions: { retries: 0 }
                  });
                },
                getRetryOption(this.cs, this.logger)
              );
            }
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        let createEditorSessionRecordPayload: CreateEditorSessionRecordPayload =
          { session: session, apiKeyParts: apiKeyParts };

        return Result.succeed(createEditorSessionRecordPayload);
      }),
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
      Result.bind('sandboxFiles', v => {
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

        return Result.succeed<SandboxFile[]>(
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
      Result.bind('createSessionRepoOutput', v =>
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
        currentSession = await this.db.sessions.findFirstCheckExistsUnwrap({
          where: eq(sessionsTable.sessionId, sessionId)
        });
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

      await this.db.writeUnwrap({
        insertOrUpdate: {
          sessions: [updatedSession],
          ocSessions: [updatedOcSession]
        }
      });

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

      await this.db
        .writeUnwrap({
          rawQueries: [
            sql`UPDATE sessions SET status = ${'Error' satisfies SessionStatus} WHERE session_id = ${sessionId}`
          ]
        })
        .catch(retryErr => {
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
      Result.bind('baseProject', v =>
        Result.succeed(
          projectTabToBaseProject({
            tabService: this.tabService,
            project: v.project
          })
        )
      ),
      // let sendToDiskStart = Date.now();
      Result.bind('diskCreateDevRepoOutput', v =>
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
      Result.bind('prodBranch', v =>
        this.db.branches.findFirst({
          where: and(
            eq(branchesTable.projectId, v.projectId),
            eq(branchesTable.repoId, PROD_REPO_ID),
            eq(branchesTable.branchId, v.project.defaultBranch)
          )
        })
      ),
      Result.bind('sessionBranch', v =>
        Result.succeed(
          makeBranch({
            projectId: v.projectId,
            repoId: v.sessionId,
            branchId: v.sessionId
          })
        )
      ),
      Result.bind('prodBranchBridges', v =>
        this.db.bridges.findMany({
          where: and(
            eq(bridgesTable.projectId, v.prodBranch.projectId),
            eq(bridgesTable.repoId, v.prodBranch.repoId),
            eq(bridgesTable.branchId, v.prodBranch.branchId)
          )
        })
      ),
      Result.bind('sessionBranchBridges', v =>
        Result.succeed(
          v.prodBranchBridges.map(bridge =>
            makeBridge({
              projectId: v.sessionBranch.projectId,
              repoId: v.sessionBranch.repoId,
              branchId: v.sessionBranch.branchId,
              envId: bridge.envId,
              structId: EMPTY_STRUCT_ID,
              needValidate: true
            })
          )
        )
      ),
      Result.andThrough(v =>
        rebuildBranchBridges({
          branchBridges: v.sessionBranchBridges,
          envId: v.envId,
          traceId: v.traceId,
          orgId: v.project.orgId,
          projectId: v.projectId,
          repoId: v.sessionId,
          diskFiles: v.diskCreateDevRepoOutput.files,
          mproveDir: v.diskCreateDevRepoOutput.mproveDir,
          db: this.db,
          tabService: this.tabService,
          rpcService: this.rpcService,
          cs: this.cs,
          logger: this.logger
        })
      ),
      Result.andThrough(v =>
        this.db.write({
          insert: {
            branches: [v.sessionBranch],
            bridges: [...v.sessionBranchBridges]
          },
          rawQueries: [
            sql`UPDATE sessions SET initial_commit = ${v.diskCreateDevRepoOutput.initialCommitHash} WHERE session_id = ${v.sessionId}`
          ]
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
