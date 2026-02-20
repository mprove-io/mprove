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
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config.js';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { eventsTable } from '#backend/drizzle/postgres/schema/events';
import { messagesTable } from '#backend/drizzle/postgres/schema/messages.js';
import { partsTable } from '#backend/drizzle/postgres/schema/parts.js';
import { sessionsTable } from '#backend/drizzle/postgres/schema/sessions';
import { getRetryOption } from '#backend/functions/get-retry-option.js';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentService } from '#backend/services/agent.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { SandboxService } from '#backend/services/sandbox.service';
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
    private sandboxService: SandboxService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteAgentSession)
  async deleteSession(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendDeleteAgentSessionRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.sandboxId && session.status !== SessionStatusEnum.Stopped) {
      let project = await this.projectsService.getProjectCheckExists({
        projectId: session.projectId
      });

      await this.agentService.stopEventStream(sessionId);

      this.sandboxService.disposeOpenCodeClient(sessionId);

      await this.sandboxService.stopSandbox({
        sandboxType: session.sandboxType as SandboxTypeEnum,
        sandboxId: session.sandboxId,
        e2bApiKey: project.e2bApiKey
      });
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(async tx => {
          await tx
            .delete(sessionsTable)
            .where(and(eq(sessionsTable.sessionId, sessionId)));

          await tx
            .delete(messagesTable)
            .where(and(eq(messagesTable.sessionId, sessionId)));

          await tx
            .delete(partsTable)
            .where(and(eq(partsTable.sessionId, sessionId)));

          await tx
            .delete(eventsTable)
            .where(and(eq(eventsTable.sessionId, sessionId)));
        }),
      getRetryOption(this.cs, this.logger)
    );

    let payload = {};

    return payload;
  }
}
