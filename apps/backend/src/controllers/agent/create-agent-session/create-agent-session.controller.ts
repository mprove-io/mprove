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
import { CreateSessionRequest, SandboxAgent } from 'sandbox-agent';
import { v4 as uuidv4 } from 'uuid';
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { MembersService } from '#backend/services/db/members.service.js';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RedisService } from '#backend/services/redis.service';
import { SandboxService } from '#backend/services/sandbox.service.js';
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

    let activeSessions = await this.sessionsService.getActiveSessionsByUserId({
      userId: user.userId
    });

    if (activeSessions.length >= maxActiveSandboxesPerUser) {
      throw new ServerError({
        message: ErEnum.BACKEND_TOO_MANY_ACTIVE_SESSIONS
      });
    }

    let sandboxTimeoutMinutes = this.cs.get<
      BackendConfig['sandboxTimeoutMinutes']
    >('sandboxTimeoutMinutes');

    let sandboxTimeoutMs = sandboxTimeoutMinutes * 50 * 1000;

    let sandboxEnvs: Record<string, string> = {};

    if (agent === 'codex') {
      if (isUndefined(project.openaiApiKey)) {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_OPENAI_API_KEY_REQUIRED_FOR_CODEX
        });
      }
      sandboxEnvs.OPENAI_API_KEY = project.openaiApiKey;
    } else if (agent === 'claude') {
      if (isUndefined(project.anthropicApiKey)) {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_ANTHROPIC_API_KEY_REQUIRED_FOR_CLAUDE
        });
      }
      sandboxEnvs.ANTHROPIC_API_KEY = project.anthropicApiKey;
    } else if (agent === 'opencode') {
      if (isUndefined(project.openaiApiKey)) {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_OPENAI_API_KEY_REQUIRED_FOR_OPENCODE
        });
      }
      sandboxEnvs.OPENAI_API_KEY = project.openaiApiKey;
    }

    console.log('creating sandbox...');

    let { sandboxId, sandboxBaseUrl, sandboxAgentToken } =
      await this.sandboxService.createSandbox({
        sandboxType: sandboxType,
        sandboxTimeoutMs: sandboxTimeoutMs,
        agent: agent,
        sandboxEnvs: sandboxEnvs,
        e2bApiKey: project.e2bApiKey
      });

    let sessionId = uuidv4();

    console.log('sandbox created');

    let sAgent: SandboxAgent = await this.sandboxService.connectSaClient({
      sessionId: sessionId,
      sandboxBaseUrl: sandboxBaseUrl,
      sandboxAgentToken: sandboxAgentToken
    });

    let sessions = await sAgent.listSessions();

    console.log('sessions');
    console.dir(sessions, { depth: null });

    let agents = await sAgent.listAgents();

    console.log('agents');
    console.dir(agents, { depth: null });

    let agentModes = await sAgent.getAgentModes(agent);

    console.log('agentModes');
    console.dir(agentModes, { depth: null });

    let agentModels = await sAgent.getAgentModels(agent);

    console.log('agentModels');
    console.dir(agentModels, { depth: null });

    let sdkCreateSessionRequest: CreateSessionRequest = {
      agent: agent,
      model: model,
      agentMode: agentMode,
      permissionMode: permissionMode
    };

    let sdkCreateSessionResponse = await sAgent
      .createSession(sessionId, sdkCreateSessionRequest)
      .catch(e => {
        throw new ServerError({
          message: ErEnum.BACKEND_AGENT_SEND_MESSAGE_FAILED,
          originalError: e
        });
      });

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
      sdkCreateSessionResponse: sdkCreateSessionResponse,
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
      await sAgent
        .postMessage(session.sessionId, { message: firstMessage })
        .catch(e => {
          throw new ServerError({
            message: ErEnum.BACKEND_AGENT_SEND_MESSAGE_FAILED,
            originalError: e
          });
        });
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
