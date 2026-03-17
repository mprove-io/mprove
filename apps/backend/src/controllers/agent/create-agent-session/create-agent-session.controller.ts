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
import type { Event, SessionPromptAsyncData } from '@opencode-ai/sdk/v2';
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
import { AgentOpencodeService } from '#backend/services/agent/agent-opencode.service.js';
import { AgentStreamAiService } from '#backend/services/agent/agent-stream-ai.service';
import { AgentStreamOpencodeService } from '#backend/services/agent/agent-stream-opencode.service';
import { ApiKeyService } from '#backend/services/api-key.service';
import { BlockmlService } from '#backend/services/blockml.service';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { MembersService } from '#backend/services/db/members.service.js';
import { OcEventsService } from '#backend/services/db/oc-events.service';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service.js';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import { makeSessionId } from '#common/functions/make-session-id';
import { splitModel } from '#common/functions/split-model';
import {
  ToBackendCreateAgentSessionRequest,
  ToBackendCreateAgentSessionResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
import {
  ToDiskCreateDevRepoRequest,
  ToDiskCreateDevRepoResponse
} from '#common/interfaces/to-disk/03-repos/to-disk-create-dev-repo';
import { ServerError } from '#common/models/server-error';

const { forEachSeries } = pIteration;

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateAgentSessionController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private sessionsService: SessionsService,
    private ocEventsService: OcEventsService,
    private agentStreamService: AgentStreamOpencodeService,
    private apiKeyService: ApiKeyService,
    private aiSdkStreamService: AgentStreamAiService,
    private agentOpencodeService: AgentOpencodeService,
    private rpcService: RpcService,
    private blockmlService: BlockmlService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private tabService: TabService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateAgentSession)
  async createSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendCreateAgentSessionRequest = request.body;
    let {
      projectId,
      sessionType,
      sandboxType,
      provider,
      model,
      agent,
      variant,
      envId,
      initialBranch,
      firstMessage
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditor({
      memberId: user.userId,
      projectId: projectId
    });

    let maxActiveSessionsPerUser = this.cs.get<
      BackendConfig['maxActiveSessionsPerUser']
    >('maxActiveSessionsPerUser');

    let activeSessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.userId, user.userId),
          eq(sessionsTable.sessionType, SessionTypeEnum.Editor),
          inArray(sessionsTable.status, [
            SessionStatusEnum.Active,
            SessionStatusEnum.New
          ])
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    if (activeSessions.length >= maxActiveSessionsPerUser) {
      throw new ServerError({
        message: ErEnum.BACKEND_TOO_MANY_ACTIVE_SANDBOX_SESSIONS
      });
    }

    if (sessionType === SessionTypeEnum.Explorer) {
      return this.createSessionTypeA({
        user: user,
        projectId: projectId,
        project: project,
        provider: provider,
        model: model,
        variant: variant,
        initialBranch: initialBranch,
        firstMessage: firstMessage
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
    if (project.openaiApiKey) {
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
        apiKeyParts = await this.apiKeyService.generateApiKeyParts();

        let sessionId = makeSessionId();

        session = this.sessionsService.makeSession({
          sessionId: sessionId,
          sessionType: SessionTypeEnum.Editor,
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
          initialCommit: undefined,
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

    let sessionApiKey = this.apiKeyService.buildSessionApiKey({
      prefix: apiKeyParts.prefix,
      sessionId: session.sessionId,
      secret: apiKeyParts.secret
    });

    sandboxEnvs.MPROVE_CLI_API_KEY = sessionApiKey;
    sandboxEnvs.MPROVE_CLI_PROJECT_ID = projectId;
    sandboxEnvs.MPROVE_CLI_HOST = this.cs.get<
      BackendConfig['sandboxMproveCliHost']
    >('sandboxMproveCliHost');

    this.activateSessionAsync({
      sessionId: session.sessionId,
      model: session.model,
      agent: session.agent,
      sandboxType: sandboxType,
      sandboxEnvs: sandboxEnvs,
      project: project,
      variant: variant,
      firstMessage: firstMessage
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
    console.log(
      `createSessionRepoAsync took ${(Date.now() - createSessionRepoStart) / 1000}s`
    );

    let payload: ToBackendCreateAgentSessionResponsePayload = {
      sessionId: session.sessionId,
      repoId: repoId,
      branchId: branchId
    };

    return payload;
  }

  private async createSessionTypeA(item: {
    user: UserTab;
    projectId: string;
    project: any;
    provider: string;
    model: string;
    variant: string;
    initialBranch: string;
    firstMessage?: string;
  }): Promise<ToBackendCreateAgentSessionResponsePayload> {
    let {
      user,
      projectId,
      project,
      provider,
      model,
      variant,
      initialBranch,
      firstMessage
    } = item;

    let now = Date.now();
    let session!: SessionTab;

    await retry(
      async () => {
        let sessionId = makeSessionId();

        session = this.sessionsService.makeSession({
          sessionId: sessionId,
          sessionType: SessionTypeEnum.Explorer,
          repoId: PROD_REPO_ID,
          branchId: initialBranch,
          userId: user.userId,
          projectId: projectId,
          sandboxType: undefined,
          provider: provider,
          model: model,
          lastMessageProviderModel: model,
          lastMessageVariant: variant,
          agent: undefined,
          firstMessage: firstMessage,
          initialBranch: initialBranch,
          initialCommit: undefined,
          status: SessionStatusEnum.Active,
          lastActivityTs: now,
          createdTs: now
        });

        let ocSession = this.sessionsService.makeOcSession({
          sessionId: sessionId
        });

        if (firstMessage) {
          let busyEvent: Event = {
            type: 'session.status',
            properties: { status: { type: 'busy' } }
          } as Event;

          ocSession = {
            ...ocSession,
            ocSessionStatus: { type: 'busy' } as any
          };

          let busyEventTab = this.ocEventsService.makeOcEvent({
            sessionId: sessionId,
            event: busyEvent,
            eventIndex: 0
          });

          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insert: {
                  sessions: [session],
                  ocSessions: [ocSession],
                  ocEvents: [busyEventTab]
                }
              })
          );
        } else {
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
        }
      },
      getRetryOption(this.cs, this.logger)
    );

    // Fire-and-forget first message streaming
    if (firstMessage) {
      let split = splitModel(model);
      let modelProvider = split ? split.providerID : provider;
      let modelId = split ? split.modelID : model;

      let apiKey = '';
      if (modelProvider === 'openai') {
        apiKey = project.openaiApiKey || '';
      } else if (modelProvider === 'anthropic') {
        apiKey = project.anthropicApiKey || '';
      }

      this.aiSdkStreamService
        .streamMessage({
          sessionId: session.sessionId,
          provider: modelProvider,
          modelId: modelId,
          apiKey: apiKey,
          userMessage: firstMessage
        })
        .catch(e => {
          logToConsoleBackend({
            log: e,
            logLevel: LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
        });
    }

    let payload: ToBackendCreateAgentSessionResponsePayload = {
      sessionId: session.sessionId,
      repoId: session.repoId,
      branchId: session.branchId
    };

    return payload;
  }

  private async activateSessionAsync(item: {
    sessionId: string;
    model?: string;
    agent?: string;
    sandboxType: SandboxTypeEnum;
    sandboxEnvs: Record<string, string>;
    project: any;
    variant?: string;
    firstMessage?: string;
  }) {
    let {
      sessionId,
      model,
      agent,
      sandboxType,
      sandboxEnvs,
      project,
      variant,
      firstMessage
    } = item;

    try {
      let sandboxTimeoutMinutes = this.cs.get<
        BackendConfig['sandboxTimeoutMinutes']
      >('sandboxTimeoutMinutes');

      let sandboxTimeoutMs = sandboxTimeoutMinutes * 60 * 1000;

      // console.log('starting opencode server...');

      let { sandboxId, sandboxBaseUrl, opencodePassword, sandboxInfo } =
        await this.agentOpencodeService.startOpencodeServer({
          sandboxType: sandboxType,
          sandboxTimeoutMs: sandboxTimeoutMs,
          sandboxEnvs: sandboxEnvs,
          project: project,
          sessionBranch: sessionId
        });

      // console.log('opencode server started');

      let opencodeClient = await this.agentOpencodeService.getOpenCodeClient({
        sessionId: sessionId,
        sandboxBaseUrl: sandboxBaseUrl,
        opencodePassword: opencodePassword
      });

      let { data: opencodeSession } = await opencodeClient.session
        .create({}, { throwOnError: true })
        .catch(e => {
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_CREATE_SESSION_FAILED,
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
              message: ErEnum.BACKEND_AGENT_FAILED_TO_GET_INITIAL_COMMIT
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

      await this.agentStreamService.startEventStream({
        sessionId: sessionId,
        opencodeSessionId: opencodeSessionId
      });

      if (firstMessage) {
        let promptBody: NonNullable<SessionPromptAsyncData['body']> = {
          parts: [{ type: 'text', text: firstMessage }]
        };

        if (agent) {
          promptBody.agent = agent;
        }

        let split = splitModel(model);

        if (split) {
          promptBody.model = split;
        }

        if (variant) {
          promptBody.variant = variant;
        }

        await opencodeClient.session
          .promptAsync(
            {
              sessionID: opencodeSessionId,
              ...promptBody
            },
            { throwOnError: true }
          )
          .catch(e => {
            throw new ServerError({
              message: ErEnum.BACKEND_AGENT_PROMPT_FAILED,
              originalError: e
            });
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
    console.log(`sendToDisk took ${(Date.now() - sendToDiskStart) / 1000}s`);

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
        console.log(
          `rebuildStruct took ${(Date.now() - rebuildStructStart) / 1000}s`
        );

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

    return { repoId, branchId };
  }
}
