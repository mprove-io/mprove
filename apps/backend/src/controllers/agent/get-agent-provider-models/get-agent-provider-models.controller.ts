import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { isNotNull } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { uconfigsTable } from '#backend/drizzle/postgres/schema/uconfigs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentModelsService } from '#backend/services/agent-models.service';
import { SandboxService } from '#backend/services/sandbox.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetAgentProviderModelsRequest,
  ToBackendGetAgentProviderModelsResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-provider-models';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetAgentProviderModelsController {
  constructor(
    private agentModelsService: AgentModelsService,
    private sandboxService: SandboxService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels)
  async getAgentProviderModels(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendGetAgentProviderModelsRequest = request.body;
    let { sessionId } = reqValid.payload;

    if (sessionId) {
      try {
        let client = this.sandboxService.getOpenCodeClient(sessionId);

        let { data } = await client.provider.list({}, { throwOnError: true });

        let models = this.agentModelsService.mapProviderModels(data.all);

        let payload: ToBackendGetAgentProviderModelsResponsePayload = {
          models: models
        };

        return payload;
      } catch (er) {
        console.log(
          'Sandbox not reachable, fall through to agentModelsService',
          er
        );

        // Sandbox not reachable, fall through to agentModelsService
      }
    }

    let uconfig = await this.db.drizzle.query.uconfigsTable
      .findFirst({
        where: isNotNull(uconfigsTable.uconfigId)
      })
      .then(x => this.tabService.uconfigEntToTab(x));

    let models =
      uconfig?.providerModels?.length > 0
        ? uconfig.providerModels
        : await this.agentModelsService.loadSharedModels();

    let payload: ToBackendGetAgentProviderModelsResponsePayload = {
      models: models
    };

    return payload;
  }
}
