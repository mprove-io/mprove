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
import { BackendConfig } from '#backend/config/backend-config';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { MembersService } from '#backend/services/db/members.service.js';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { SessionsService } from '#backend/services/db/sessions.service';
import { RedisService } from '#backend/services/redis.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
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

    let session = await this.agentService.createSession({
      userId: user.userId,
      projectId: projectId,
      sandboxType: sandboxType,
      sandboxTimeoutMs: sandboxTimeoutMs,
      agent: agent,
      agentMode: agentMode,
      permissionMode: permissionMode,
      e2bApiKey: project.e2bApiKey,
      zenApiKey: project.zenApiKey
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
      await this.agentService.sendMessage({
        sessionId: session.sessionId,
        message: firstMessage
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
