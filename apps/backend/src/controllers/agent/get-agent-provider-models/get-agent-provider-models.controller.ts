import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { AgentModelsAiService } from '#backend/services/agent/agent-models-ai.service';
import { AgentModelsOpencodeService } from '#backend/services/agent/agent-models-opencode.service';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
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
    private agentModelsAiSdkService: AgentModelsAiService,
    private agentModelsOpencodeService: AgentModelsOpencodeService,
    private projectsService: ProjectsService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetAgentProviderModels)
  async getAgentProviderModels(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendGetAgentProviderModelsRequest = request.body;
    let { sessionTypes, projectId, forceLoadFromCache } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let [modelsAi, modelsOpencode] = await Promise.all([
      sessionTypes.includes(SessionTypeEnum.Explorer)
        ? this.agentModelsAiSdkService.getAiModels({
            projectId: projectId,
            openaiApiKey: project.openaiApiKey,
            anthropicApiKey: project.anthropicApiKey,
            enableLoadFromCache: false,
            forceLoadFromCache: forceLoadFromCache
          })
        : [],
      sessionTypes.includes(SessionTypeEnum.Editor)
        ? this.agentModelsOpencodeService.getOpencodeModels({
            projectId: projectId,
            openaiApiKey: project.openaiApiKey,
            anthropicApiKey: project.anthropicApiKey,
            zenApiKey: project.zenApiKey,
            enableLoadFromCache: false,
            forceLoadFromCache: forceLoadFromCache
          })
        : []
    ]);

    let payload: ToBackendGetAgentProviderModelsResponsePayload = {
      modelsOpencode: modelsOpencode,
      modelsAi: modelsAi
    };

    return payload;
  }
}
