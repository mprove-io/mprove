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
import { and, eq, inArray, sql } from 'drizzle-orm';
import pIteration from 'p-iteration';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  OcSessionTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { branchesTable } from '#backend/drizzle/postgres/schema/branches';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { logToConsoleBackend } from '#backend/functions/log-to-console-backend';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { BlockmlService } from '#backend/services/blockml.service';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { MembersService } from '#backend/services/db/members.service.js';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { EditorCodexService } from '#backend/services/editor/editor-codex.service';
import { EditorConnectionsService } from '#backend/services/editor/editor-connections.service';
import { EditorOpencodeService } from '#backend/services/editor/editor-opencode.service';
import { EditorStreamService } from '#backend/services/editor/editor-stream.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service.js';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { InteractionTypeEnum } from '#common/enums/interaction-type.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import { makeId } from '#common/functions/make-id';
import { makeSessionId } from '#common/functions/make-session-id';
import {
  ToBackendCreateEditorSessionRequest,
  ToBackendCreateEditorSessionResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-create-editor-session';
import {
  ToDiskCreateDevRepoRequest,
  ToDiskCreateDevRepoResponse
} from '#common/interfaces/to-disk/03-repos/to-disk-create-dev-repo';
import { ServerError } from '#common/models/server-error';
import { buildSessionApiKey } from '#node-common/functions/api-key/build-session-api-key';
import { generateApiKeyParts } from '#node-common/functions/api-key/generate-api-key-parts';

const { forEachSeries } = pIteration;

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateEditorSessionController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private editorStreamService: EditorStreamService,
    private editorOpencodeService: EditorOpencodeService,
    private editorCodexService: EditorCodexService,
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

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateEditorSession)
  async createEditorSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateEditorSessionRequest = request.body;
    let {
      projectId,
      sandboxType,
      provider,
      model,
      agent,
      variant,
      envId,
      initialBranch,
      firstMessage,
      messageId,
      partId,
      useCodex
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditor({
      memberId: user.userId,
      projectId: projectId
    });

    let maxActiveEditorSessionsPerProjectUser = this.cs.get<
      BackendConfig['maxActiveEditorSessionsPerProjectUser']
    >('maxActiveEditorSessionsPerProjectUser');

    let activeSessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.userId, user.userId),
          eq(sessionsTable.type, SessionTypeEnum.Editor),
          inArray(sessionsTable.status, [
            SessionStatusEnum.Active,
            SessionStatusEnum.New
          ])
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    if (activeSessions.length >= maxActiveEditorSessionsPerProjectUser) {
      throw new ServerError({
        message: ErEnum.BACKEND_TOO_MANY_ACTIVE_EDITOR_SESSIONS
      });
    }

    if (
      useCodex === true &&
      isDefinedAndNotEmpty(user.codexAuthJson) === false
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET
      });
    }

    // Type Editor: existing sandboxed opencode flow

    let sandboxEnvs: Record<string, string> = {};

    if (project.zenApiKey) {
      sandboxEnvs.OPENCODE_API_KEY = project.zenApiKey;
    }
    if (project.anthropicApiKey) {
      sandboxEnvs.ANTHROPIC_API_KEY = project.anthropicApiKey;
    }
    if (project.openaiApiKey && useCodex === false) {
      sandboxEnvs.OPENAI_API_KEY = project.openaiApiKey;
    }

    // Phase 1: Save session with status=New and return immediately

    let now = Date.now();
    let session!: SessionTab;

    let apiKeyParts: {
      prefix: string;
      secret: string;
      secretHash: string;
      salt: string;
    };

    await retry(
      async () => {
        apiKeyParts = await generateApiKeyParts();

        let sessionId = makeSessionId();

        session = this.sessionsService.makeSession({
          sessionId: sessionId,
          type: SessionTypeEnum.Editor,
          repoId: sessionId,
          branchId: sessionId,
          userId: user.userId,
          projectId: projectId,
          sandboxType: sandboxType,
          provider: provider,
          model: model,
          lastMessageProviderModel: model,
          lastMessageVariant: variant,
          agent: agent,
          firstMessage: firstMessage,
          apiKeyPrefix: apiKeyParts.prefix,
          apiKeySecretHash: apiKeyParts.secretHash,
          apiKeySalt: apiKeyParts.salt,
          initialBranch: initialBranch,
          envId: envId,
          initialCommit: undefined,
          useCodex: useCodex,
          codexAuthUpdateTs:
            useCodex === true ? user.codexAuthUpdateTs : undefined,
          status: SessionStatusEnum.New,
          lastActivityTs: now,
          createdTs: now
        });

        let ocSession = this.sessionsService.makeOcSession({
          sessionId: sessionId
        });

        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
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

    // Phase 2: Activate session asynchronously (fire-and-forget)

    let sessionApiKey = buildSessionApiKey({
      prefix: apiKeyParts.prefix,
      sessionId: session.sessionId,
      secret: apiKeyParts.secret
    });

    sandboxEnvs.MPROVE_CLI_API_KEY = sessionApiKey;
    sandboxEnvs.MPROVE_CLI_PROJECT_ID = projectId;
    sandboxEnvs.MPROVE_CLI_HOST = this.cs.get<
      BackendConfig['sandboxMproveCliHost']
    >('sandboxMproveCliHost');

    let { malloyConnectionEnvs, malloySandboxFiles } =
      await this.editorConnectionsService.getMalloySandboxEnvsAndFiles({
        projectId: projectId,
        envId: envId
      });

    // disabled malloy-cli in sandbox
    // Object.assign(sandboxEnvs, malloyConnectionEnvs);

    let sessionDataFile = {
      path: '/home/user/.config/opencode/mprove-session.json',
      data: JSON.stringify(
        {
          projectId: projectId,
          repoId: session.sessionId,
          branchId: session.sessionId,
          envId: envId,
          note: 'For mprove cli - no need to specify projectId, because it is already set in MPROVE_CLI_PROJECT_ID env var'
        },
        null,
        2
      )
    };

    let codexAuthFile: { path: string; data: string };

    if (useCodex === true) {
      codexAuthFile = this.editorCodexService.buildCodexAuthFile({
        codexAuthJson: user.codexAuthJson
      });
    }

    let sandboxFiles = codexAuthFile
      ? [
          // ...malloySandboxFiles,  // disabled malloy-cli in sandbox
          sessionDataFile,
          codexAuthFile
        ]
      : [
          // ...malloySandboxFiles, // disabled malloy-cli in sandbox
          sessionDataFile
        ];

    this.activateSessionAsync({
      sessionId: session.sessionId,
      projectId: projectId,
      envId: envId,
      model: session.model,
      agent: session.agent,
      sandboxType: sandboxType,
      sandboxEnvs: sandboxEnvs,
      sandboxFiles: sandboxFiles,
      project: project,
      variant: variant,
      firstMessage: firstMessage,
      messageId: messageId,
      partId: partId
    }).catch(e => {
      logToConsoleBackend({
        log: e,
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });
    });

    // Phase 3: Create session repo (awaited)

    let createSessionRepoStart = Date.now();
    let { repoId, branchId } = await this.createSessionRepoAsync({
      session: session,
      project: project,
      envId: envId,
      initialBranch: initialBranch,
      traceId: reqValid.info.traceId
    });
    // console.log(
    //   `createSessionRepoAsync took ${(Date.now() - createSessionRepoStart) / 1000}s`
    // );

    let payload: ToBackendCreateEditorSessionResponsePayload = {
      sessionId: session.sessionId,
      repoId: repoId,
      branchId: branchId,
      envId: session.envId
    };

    return payload;
  }

  private async activateSessionAsync(item: {
    sessionId: string;
    projectId: string;
    envId: string;
    model?: string;
    agent?: string;
    sandboxType: SandboxTypeEnum;
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
      model,
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

      let opencodeClient = await this.editorOpencodeService.getOpenCodeClient({
        sessionId: sessionId,
        sandboxBaseUrl: sandboxBaseUrl,
        opencodePassword: opencodePassword
      });

      let { data: opencodeSession } = await opencodeClient.session
        .create({}, { throwOnError: true })
        .catch(e => {
          throw new ServerError({
            message: ErEnum.BACKEND_CREATE_SESSION_FAILED,
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
        currentSession = await this.sessionsService.getSessionByIdCheckExists({
          sessionId
        });
        if (currentSession.initialCommit) break;
        if (Date.now() - start >= retryMs) {
          await this.db.drizzle.execute(
            sql`UPDATE sessions SET status = ${SessionStatusEnum.Error} WHERE session_id = ${sessionId}`
          );
          logToConsoleBackend({
            log: new ServerError({
              message: ErEnum.BACKEND_FAILED_TO_GET_INITIAL_COMMIT
            }),
            logLevel: LogLevelEnum.Error,
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
        status: SessionStatusEnum.Active,
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
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  sessions: [updatedSession],
                  ocSessions: [updatedOcSession]
                }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );

      let isStreamStartedFresh =
        await this.editorStreamService.startEventStream({
          sessionId: sessionId,
          opencodeSessionId: opencodeSessionId,
          isSetReload: false
        });

      if (firstMessage) {
        // system prompt now handled via opencode instructions mechanism
        // (see mprove-instructions.md and mprove-session.json)

        try {
          await this.editorStreamService.executeInteraction({
            sessionId: sessionId,
            opencodeSessionId: opencodeSessionId,
            interactionType: InteractionTypeEnum.Message,
            message: firstMessage,
            agent: agent,
            model: model,
            variant: variant,
            messageId: messageId,
            partId: partId
          });
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
        logLevel: LogLevelEnum.Error,
        logger: this.logger,
        cs: this.cs
      });

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                rawQueries: [
                  sql`UPDATE sessions SET status = ${SessionStatusEnum.Error} WHERE session_id = ${sessionId}`
                ]
              })
          ),
        getRetryOption(this.cs, this.logger)
      ).catch(retryErr => {
        logToConsoleBackend({
          log: retryErr,
          logLevel: LogLevelEnum.Error,
          logger: this.logger,
          cs: this.cs
        });
      });

      throw e;
    }
  }

  private async createSessionRepoAsync(item: {
    session: SessionTab;
    project: any;
    envId: string;
    initialBranch: string;
    traceId: string;
  }): Promise<{ repoId: string; branchId: string }> {
    let { session, project, envId, initialBranch, traceId } = item;
    let sessionId = session.sessionId;
    let projectId = session.projectId;

    let baseProject = this.tabService.projectTabToBaseProject({
      project: project
    });

    let toDiskCreateDevRepoRequest: ToDiskCreateDevRepoRequest = {
      info: {
        name: ToDiskRequestInfoNameEnum.ToDiskCreateDevRepo,
        traceId: traceId
      },
      payload: {
        orgId: project.orgId,
        baseProject: baseProject,
        devRepoId: sessionId,
        initialBranch: initialBranch,
        sessionBranch: sessionId
      }
    };

    let sendToDiskStart = Date.now();
    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskCreateDevRepoResponse>({
        orgId: project.orgId,
        projectId: projectId,
        repoId: sessionId,
        message: toDiskCreateDevRepoRequest,
        checkIsOk: true
      });
    // console.log(`sendToDisk took ${(Date.now() - sendToDiskStart) / 1000}s`);

    let repoId = sessionId;
    let branchId = sessionId;
    let initialCommit = diskResponse.payload.initialCommitHash;

    let prodBranch = await this.db.drizzle.query.branchesTable.findFirst({
      where: and(
        eq(branchesTable.projectId, projectId),
        eq(branchesTable.repoId, PROD_REPO_ID),
        eq(branchesTable.branchId, project.defaultBranch)
      )
    });

    let sessionBranch = this.branchesService.makeBranch({
      projectId: projectId,
      repoId: sessionId,
      branchId: sessionId
    });

    let prodBranchBridges = await this.db.drizzle.query.bridgesTable.findMany({
      where: and(
        eq(bridgesTable.projectId, prodBranch.projectId),
        eq(bridgesTable.repoId, prodBranch.repoId),
        eq(bridgesTable.branchId, prodBranch.branchId)
      )
    });

    let sessionBranchBridges: BridgeTab[] = [];

    prodBranchBridges.forEach(x => {
      let sessionBranchBridge = this.bridgesService.makeBridge({
        projectId: sessionBranch.projectId,
        repoId: sessionBranch.repoId,
        branchId: sessionBranch.branchId,
        envId: x.envId,
        structId: EMPTY_STRUCT_ID,
        needValidate: true
      });

      sessionBranchBridges.push(sessionBranchBridge);
    });

    await forEachSeries(sessionBranchBridges, async x => {
      if (x.envId === envId) {
        let structId = makeId();

        let rebuildStructStart = Date.now();
        await this.blockmlService.rebuildStruct({
          traceId: traceId,
          orgId: project.orgId,
          projectId: projectId,
          repoId: sessionId,
          structId: structId,
          diskFiles: diskResponse.payload.files,
          mproveDir: diskResponse.payload.mproveDir,
          envId: x.envId,
          overrideTimezone: undefined
        });
        // console.log(
        //   `rebuildStruct took ${(Date.now() - rebuildStructStart) / 1000}s`
        // );

        x.structId = structId;
        x.needValidate = false;
      } else {
        x.structId = EMPTY_STRUCT_ID;
        x.needValidate = true;
      }
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                branches: [sessionBranch],
                bridges: [...sessionBranchBridges]
              },
              rawQueries: [
                sql`UPDATE sessions SET initial_commit = ${initialCommit} WHERE session_id = ${sessionId}`
              ]
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    return { repoId: repoId, branchId: branchId };
  }
}
