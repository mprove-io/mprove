import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetLlmModelsWithProviderRequestDto,
  ToBackendGetLlmModelsWithProviderResponseDto
} from '#backend/controllers/llm-models/get-llm-models-with-provider/get-llm-models-with-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { SessionTypeEnum } from '#common/enums/session-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { LlmModelWithProvider } from '#common/zod/backend/llm-models/llm-model-with-provider';
import type { ToBackendGetLlmModelsWithProviderResponsePayload } from '#common/zod/to-backend/llm-models/get-llm-models-with-provider/get-llm-models-with-provider';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetLlmModelsWithProviderController {
  constructor(
    private membersService: MembersService,
    private projectsService: ProjectsService,
    private providersService: ProvidersService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetLlmModelsWithProvider)
  @ApiOperation({
    summary: 'GetLlmModelsWithProvider',
    description: 'List available LLM provider models'
  })
  @ApiOkResponse({
    type: ToBackendGetLlmModelsWithProviderResponseDto
  })
  async getLlmModelsWithProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetLlmModelsWithProviderRequestDto
  ) {
    let { sessionTypes, projectId } = body.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let providers = await this.providersService.getEnabledProviders({
      projectId: projectId
    });

    let isUserCodexAuthSet = isDefined(user.codexAuth);

    let visibleProviders = providers.filter(
      provider =>
        provider.type !== ProviderTypeEnum.OpenAICodex || isUserCodexAuthSet
    );

    let modelsWithProvider: LlmModelWithProvider[][] = visibleProviders.map(
      provider =>
        provider.models.map(model => ({
          ...model,
          providerId: provider.providerId,
          providerName: provider.name
        }))
    );

    let allModels: LlmModelWithProvider[] = modelsWithProvider.flat();

    let modelsAi: LlmModelWithProvider[] = sessionTypes.includes(
      SessionTypeEnum.Explorer
    )
      ? allModels
          .filter(model => model.isExplorer)
          .map(model => ({
            ...model,
            variants: model.variants.filter(variant => variant.isExplorer)
          }))
      : [];

    let modelsOpencode: LlmModelWithProvider[] = sessionTypes.includes(
      SessionTypeEnum.Editor
    )
      ? allModels
          .filter(model => model.isOpencodeSupported && model.isBuilder)
          .map(model => ({
            ...model,
            variants: model.variants.filter(variant => variant.isBuilder)
          }))
      : [];

    let payload: ToBackendGetLlmModelsWithProviderResponsePayload = {
      modelsOpencode: modelsOpencode,
      modelsAi: modelsAi
    };

    return payload;
  }
}
