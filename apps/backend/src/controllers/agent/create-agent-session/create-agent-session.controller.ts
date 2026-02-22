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
import { and, eq, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions.js';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { MembersService } from '#backend/services/db/members.service.js';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { SandboxService } from '#backend/services/sandbox.service.js';
import { TabService } from '#backend/services/tab.service.js';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { splitModel } from '#common/functions/split-model';
import {
  ToBackendCreateAgentSessionRequest,
  ToBackendCreateAgentSessionResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';
import { ServerError } from '#common/models/server-error';

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

    let sessionId = uuidv4();
    let now = Date.now();

    let session: SessionTab = this.sessionsService.makeSession({
      sessionId: sessionId,
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
      status: SessionStatusEnum.New,
      lastActivityTs: now,
      createdTs: now
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                sessions: [session]
              }
            })
        ),
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
      console.log(
        `Failed to activate session ${sessionId}: ${e?.message}`,
        e?.stack
      );
    });

    let payload: ToBackendCreateAgentSessionResponsePayload = {
      sessionId: session.sessionId
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

      console.log('starting opencode server...');

      let { sandboxId, sandboxBaseUrl, opencodePassword } =
        await this.sandboxService.startOpencodeServer({
          sandboxType: sandboxType,
          sandboxTimeoutMs: sandboxTimeoutMs,
          sandboxEnvs: sandboxEnvs,
          project: project
        });

      console.log('opencode server started');

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
        ocSession: opencodeSession,
        status: SessionStatusEnum.Active,
        lastActivityTs: now,
        runningStartTs: now,
        expiresAt: now + sandboxTimeoutMs
      };

      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                insertOrUpdate: {
                  sessions: [updatedSession]
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
      console.log(
        `Session activation failed for ${sessionId}: ${e?.message}`,
        e?.stack
      );

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
        console.log(
          `Failed to update session ${sessionId} to Error status: ${retryErr?.message}`,
          retryErr?.stack
        );
      });

      throw e;
    }
  }
}
