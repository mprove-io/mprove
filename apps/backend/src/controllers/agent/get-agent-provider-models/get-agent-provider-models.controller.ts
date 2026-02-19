import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentModelsService } from '#backend/services/agent-models.service';
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
  constructor(private agentModelsService: AgentModelsService) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels)
  async getAgentProviderModels(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendGetAgentProviderModelsRequest = request.body;
    let { provider } = reqValid.payload;

    let models = await this.agentModelsService.getModelsForProvider(provider);

    let payload: ToBackendGetAgentProviderModelsResponsePayload = {
      models: models
    };

    return payload;
  }
}
