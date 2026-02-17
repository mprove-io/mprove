import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { SessionsService } from '#backend/services/db/sessions.service';
import { SandboxService } from '#backend/services/sandbox.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { SessionStatusEnum } from '#common/enums/session-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { AgentModelApi } from '#common/interfaces/backend/agent-model-api';
import {
  ToBackendGetAgentSessionModelsRequest,
  ToBackendGetAgentSessionModelsResponsePayload
} from '#common/interfaces/to-backend/agent/to-backend-get-agent-session-models';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetAgentSessionModelsController {
  constructor(
    private sessionsService: SessionsService,
    private sandboxService: SandboxService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentSessionModels)
  async getAgentSessionModels(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendGetAgentSessionModelsRequest = request.body;
    let { sessionId } = reqValid.payload;

    let session = await this.sessionsService.getSessionByIdCheckExists({
      sessionId
    });

    if (session.userId !== user.userId) {
      throw new ServerError({
        message: ErEnum.BACKEND_UNAUTHORIZED
      });
    }

    if (session.status !== SessionStatusEnum.Active) {
      throw new ServerError({
        message: ErEnum.BACKEND_AGENT_SESSION_NOT_READY
      });
    }

    let client = this.sandboxService.getOpenCodeClient(sessionId);

    let { data } = await client.provider.list({
      throwOnError: true
    });

    let connectedSet = new Set(data.connected);

    let models: AgentModelApi[] = [];

    for (let provider of data.all) {
      if (!connectedSet.has(provider.id)) {
        continue;
      }

      for (let modelKey of Object.keys(provider.models)) {
        let model = provider.models[modelKey];
        models.push({
          id: model.id,
          name: model.name,
          providerId: provider.id,
          providerName: provider.name
        });
      }
    }

    let payload: ToBackendGetAgentSessionModelsResponsePayload = {
      models: models
    };

    return payload;
  }
}
