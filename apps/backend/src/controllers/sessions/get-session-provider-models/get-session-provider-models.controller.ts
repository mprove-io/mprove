import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { ProjectsService } from '#backend/services/db/projects.service.js';
import { EditorModelsService } from '#backend/services/editor/editor-models.service';
import { ExplorerModelsService } from '#backend/services/explorer/explorer-models.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetSessionProviderModelsRequest,
  ToBackendGetSessionProviderModelsResponsePayload
} from '#common/interfaces/to-backend/sessions/to-backend-get-session-provider-models';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSessionProviderModelsController {
  constructor(
    private explorerModelsService: ExplorerModelsService,
    private editorModelsService: EditorModelsService,
    private projectsService: ProjectsService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetSessionProviderModels)
  async getSessionProviderModels(
    @AttachUser() user: UserTab,
    @Req() request: any
  ) {
    let reqValid: ToBackendGetSessionProviderModelsRequest = request.body;
    let { sessionTypes, projectId, forceLoadFromCache } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let [modelsAi, modelsOpencode] = await Promise.all([
      sessionTypes.includes(SessionTypeEnum.Explorer)
        ? this.explorerModelsService.getAiModels({
            projectId: projectId,
            openaiApiKey: project.openaiApiKey,
            anthropicApiKey: project.anthropicApiKey,
            enableLoadFromCache: false,
            forceLoadFromCache: forceLoadFromCache
          })
        : [],
      sessionTypes.includes(SessionTypeEnum.Editor)
        ? this.editorModelsService.getOpencodeModels({
            projectId: projectId,
            openaiApiKey: project.openaiApiKey,
            anthropicApiKey: project.anthropicApiKey,
            zenApiKey: project.zenApiKey,
            enableLoadFromCache: false,
            forceLoadFromCache: forceLoadFromCache
          })
        : []
    ]);

    let payload: ToBackendGetSessionProviderModelsResponsePayload = {
      modelsOpencode: modelsOpencode,
      modelsAi: modelsAi
    };

    return payload;
  }
}
