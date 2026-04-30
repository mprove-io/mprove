import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetSessionProviderModelsRequestDto,
  ToBackendGetSessionProviderModelsResponseDto
} from '#backend/controllers/sessions/get-session-provider-models/get-session-provider-models.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { EditorModelsService } from '#backend/services/editor/editor-models.service';
import { ExplorerModelsService } from '#backend/services/explorer/explorer-models.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ToBackendGetSessionProviderModelsResponsePayload } from '#common/zod/to-backend/sessions/to-backend-get-session-provider-models';

@ApiTags('Sessions')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetSessionProviderModelsController {
  constructor(
    private explorerModelsService: ExplorerModelsService,
    private editorModelsService: EditorModelsService,
    private membersService: MembersService,
    private projectsService: ProjectsService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetSessionProviderModels)
  @ApiOperation({
    summary: 'GetSessionProviderModels',
    description: 'List available LLM provider models'
  })
  @ApiOkResponse({
    type: ToBackendGetSessionProviderModelsResponseDto
  })
  async getSessionProviderModels(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetSessionProviderModelsRequestDto
  ) {
    let { sessionTypes, projectId, forceLoadFromCache } = body.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let [modelsAi, modelsOpencode] = await Promise.all([
      sessionTypes.includes(SessionTypeEnum.Explorer)
        ? this.explorerModelsService.getAiModels({
            projectId: projectId,
            openaiApiKey: project.openaiApiKey,
            anthropicApiKey: project.anthropicApiKey,
            isUserCodexAuthSet: isDefined(user.codexAuth),
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
            isUserCodexAuthSet: isDefined(user.codexAuth),
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
