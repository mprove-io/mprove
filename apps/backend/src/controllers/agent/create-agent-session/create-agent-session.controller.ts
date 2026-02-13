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
import { SandboxAgent, SessionRecord } from 'sandbox-agent';
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
import { RedisService } from '#backend/services/redis.service';
import { SandboxService } from '#backend/services/sandbox.service.js';
import { TabService } from '#backend/services/tab.service.js';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { makeId } from '#common/functions/make-id';
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
    private redisService: RedisService,
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
      agent,
      model,
      agentMode,
      permissionMode,
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
          inArray(sessionsTable.status, [SessionStatusEnum.Active])
        )
      })
      .then(xs => xs.map(x => this.tabService.sessionEntToTab(x)));

    if (activeSessions.length >= maxActiveSandboxesPerUser) {
      throw new ServerError({
        message: ErEnum.BACKEND_TOO_MANY_ACTIVE_SESSIONS
      });
    }

    let sandboxTimeoutMinutes = this.cs.get<
      BackendConfig['sandboxTimeoutMinutes']
    >('sandboxTimeoutMinutes');

    // intentionally * 50 (not * 60) to pause sandbox before provider does
    let sandboxTimeoutMs = sandboxTimeoutMinutes * 50 * 1000;

    let sandboxEnvs: Record<string, string> = {};

    if (agent === 'codex') {
      if (isUndefined(project.openaiApiKey)) {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_OPENAI_API_KEY_REQUIRED_FOR_CODEX
        });
      }
      // sandboxEnvs.OPENAI_API_KEY = project.openaiApiKey;
      sandboxEnvs.CODEX_API_KEY = project.openaiApiKey;
    } else if (agent === 'claude') {
      if (isUndefined(project.anthropicApiKey)) {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_ANTHROPIC_API_KEY_REQUIRED_FOR_CLAUDE
        });
      }
      sandboxEnvs.ANTHROPIC_API_KEY = project.anthropicApiKey;
    } else if (agent === 'opencode') {
      if (isUndefined(project.zenApiKey)) {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_ZEN_API_KEY_REQUIRED_FOR_OPENCODE
        });
      }
      sandboxEnvs.OPENCODE_API_KEY = project.zenApiKey;
    }

    console.log('starting sandboxAgent server...');

    let { sandboxId, sandboxBaseUrl, sandboxAgentToken } =
      await this.sandboxService.startSandboxAgentServer({
        sandboxType: sandboxType,
        sandboxTimeoutMs: sandboxTimeoutMs,
        sandboxEnvs: sandboxEnvs,
        agent: agent,
        project: project
      });

    console.log('sandboxAgent server started');

    let sessionId = uuidv4();

    let sandboxAgent: SandboxAgent =
      await this.sandboxService.connectSandboxAgent({
        sessionId: sessionId,
        sandboxBaseUrl: sandboxBaseUrl,
        sandboxAgentToken: sandboxAgentToken
      });

    // let agentInfo = await sandboxAgent.getAgent(agent);

    // if (!agentInfo.credentialsAvailable) {
    //   throw new ServerError({
    //     message: ErEnum.BACKEND_AGENT_CREDENTIALS_NOT_AVAILABLE
    //   });
    // }

    let sdkSession = await sandboxAgent
      .createSession({
        id: sessionId,
        agent: agent
      })
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_CREATE_SESSION_FAILED,
          originalError: e
        });
      });

    // if (model) {
    //   let { response: setModelResponse } =
    //     await sandboxAgent.sendSessionMethod(
    //       sessionId,
    //       'session/set_model',
    //       { sessionId: sessionId, modelId: model }
    //     );

    //   console.log(
    //     'set_model response:',
    //     JSON.stringify(setModelResponse, null, 2)
    //   );
    // }

    let sessionRecord: SessionRecord = sdkSession.toRecord();

    let now = Date.now();

    let session: SessionTab = this.sessionsService.makeSession({
      sessionId: sessionId,
      userId: user.userId,
      projectId: projectId,
      sandboxType: sandboxType,
      agent: agent,
      model: model,
      agentMode: agentMode,
      permissionMode: permissionMode,
      sandboxId: sandboxId,
      sandboxBaseUrl: sandboxBaseUrl,
      sandboxAgentToken: sandboxAgentToken,
      sessionRecord: sessionRecord,
      status: SessionStatusEnum.Active,
      lastActivityTs: now,
      runningStartTs: now,
      expiresAt: now + sandboxTimeoutMs,
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

    this.agentService.startEventStream({
      sessionId: session.sessionId
    });

    if (firstMessage) {
      let promptResponse = await sdkSession
        .prompt([{ type: 'text', text: firstMessage }])
        .catch(e => {
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_PROMPT_FAILED,
            originalError: e
          });
        });

      // console.log(
      //   'firstMessage prompt response:',
      //   JSON.stringify(promptResponse, null, 2)
      // );
    }

    let sseTicket = makeId();

    await this.redisService.writeTicket({
      ticket: sseTicket,
      sessionId: session.sessionId
    });

    let payload: ToBackendCreateAgentSessionResponsePayload = {
      sessionId: session.sessionId,
      sseTicket: sseTicket
    };

    return payload;
  }
}
