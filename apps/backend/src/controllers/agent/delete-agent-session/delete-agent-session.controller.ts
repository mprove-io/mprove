import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { eq } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { eventsTable } from '#backend/drizzle/postgres/schema/events';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { SandboxTypeEnum } from '#common/enums/sandbox-type.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ToBackendDeleteAgentSessionRequest } from '#common/interfaces/to-backend/agent/to-backend-delete-agent-session';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteAgentSessionController {
  constructor(
    private sessionsService: SessionsService,
    private projectsService: ProjectsService,
    private agentService: AgentService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteAgentSession)
  async deleteSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteAgentSessionRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getById({ sessionId });

    if (
      session.providerSandboxId &&
      session.status !== SessionStatusEnum.Stopped
    ) {
      let project = await this.projectsService.getProjectCheckExists({
        projectId: session.projectId
      });

      await this.agentService
        .stopSandbox({
          sessionId: sessionId,
          sandboxType: session.sandboxType as SandboxTypeEnum,
          providerSandboxId: session.providerSandboxId,
          e2bApiKey: project.e2bApiKey
        })
        .catch(() => {});
    }

    await this.db.drizzle
      .delete(eventsTable)
      .where(eq(eventsTable.sessionId, sessionId));

    await this.db.drizzle
      .delete(sessionsTable)
      .where(eq(sessionsTable.sessionId, sessionId));

    let payload = {};

    return payload;
  }
}
