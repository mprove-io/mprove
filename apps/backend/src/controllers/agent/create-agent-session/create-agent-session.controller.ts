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
import { AgentService } from '#backend/services/agent.service';
import { BlockmlService } from '#backend/services/blockml.service';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { MembersService } from '#backend/services/db/members.service.js';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RpcService } from '#backend/services/rpc.service';
import { SandboxService } from '#backend/services/sandbox.service.js';
import { TabService } from '#backend/services/tab.service.js';
import { EMPTY_STRUCT_ID, PROD_REPO_ID } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { LogLevelEnum } from '#common/enums/log-level.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
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
    private agentService: AgentService,
    private sandboxService: SandboxService,
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
      sandboxType,
      provider,
      model,
      agent,
      permissionMode,
      variant,
      envId,
      initialBranch,
      firstMessage
    } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      memberId: user.userId,
      projectId: projectId
    });

    let maxActiveSandboxesPerUser = this.cs.get<
      BackendConfig['maxActiveSessionsPerUser']
    >('maxActiveSessionsPerUser');

    let activeSessions = await this.db.drizzle.query.sessionsTable
      .findMany({
        where: and(
          eq(sessionsTable.userId, user.userId),
          inArray(sessionsTable.status, [
            SessionStatusEnum.Active,
            SessionStatusEnum.New
          ])
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    if (activeSessions.length >= maxActiveSandboxesPerUser) {
      throw new ServerError({
        message: ErEnum.BACKEND_TOO_MANY_ACTIVE_SESSIONS
      });
    }

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

    await retry(
      async () => {
        let sessionId = makeSessionId();

        session = this.sessionsService.makeSession({
          sessionId: sessionId,
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
          permissionMode: permissionMode,
          firstMessage: firstMessage,
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

    this.activateSessionAsync({
      session: session,
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

    let { repoId, branchId } = await this.createSessionRepoAsync({
      session: session,
      project: project,
      envId: envId,
      initialBranch: initialBranch,
      traceId: reqValid.info.traceId
    });

    let payload: ToBackendCreateAgentSessionResponsePayload = {
      sessionId: session.sessionId,
      repoId: repoId,
      branchId: branchId
    };

    return payload;
  }

  private async activateSessionAsync(item: {
    session: SessionTab;
    sandboxType: SandboxTypeEnum;
    sandboxEnvs: Record<string, string>;
    project: any;
    variant?: string;
    firstMessage?: string;
  }) {
    let { session, sandboxType, sandboxEnvs, project, variant, firstMessage } =
      item;

    let sessionId = session.sessionId;

    try {
      let sandboxTimeoutMinutes = this.cs.get<
        BackendConfig['sandboxTimeoutMinutes']
      >('sandboxTimeoutMinutes');

      // intentionally * 50 (not * 60) to pause sandbox before provider does
      let sandboxTimeoutMs = sandboxTimeoutMinutes * 50 * 1000;

      // console.log('starting opencode server...');

      let { sandboxId, sandboxBaseUrl, opencodePassword } =
        await this.sandboxService.startOpencodeServer({
          sandboxType: sandboxType,
          sandboxTimeoutMs: sandboxTimeoutMs,
          sandboxEnvs: sandboxEnvs,
          project: project
        });

      // console.log('opencode server started');

      let opencodeClient = this.sandboxService.connectOpenCodeClient({
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

      let updatedSession: SessionTab = {
        ...session,
        sandboxId: sandboxId,
        sandboxBaseUrl: sandboxBaseUrl,
        opencodeSessionId: opencodeSessionId,
        opencodePassword: opencodePassword,
        status: SessionStatusEnum.Active,
        lastActivityTs: now,
        runningStartTs: now,
        expiresAt: now + sandboxTimeoutMs
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

      await this.agentService.startEventStream({
        sessionId: sessionId
      });

      if (firstMessage) {
        let promptBody: any = {
          parts: [{ type: 'text', text: firstMessage }]
        };

        let split = splitModel(session.model);
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

      let errorSession: SessionTab = {
        ...session,
        status: SessionStatusEnum.Error
      };

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  sessions: [errorSession]
                }
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

    let diskResponse =
      await this.rpcService.sendToDisk<ToDiskCreateDevRepoResponse>({
        orgId: project.orgId,
        projectId: projectId,
        repoId: sessionId,
        message: toDiskCreateDevRepoRequest,
        checkIsOk: true
      });

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
