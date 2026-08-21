import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ToBackendGetLlmModelPartsRequestDto,
  ToBackendGetLlmModelPartsResponseDto
} from '#backend/controllers/llm-models/get-llm-model-parts/get-llm-model-parts.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import {
  type LlmModelPartsResult,
  LlmModelService
} from '#backend/services/llm-model.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendGetLlmModelPartsRequestPayload } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-request-payload';
import type { ToBackendGetLlmModelPartsResponsePayload } from '#common/zod/to-backend/llm-models/get-llm-model-parts/get-llm-model-parts-response-payload';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetLlmModelPartsController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private llmModelService: LlmModelService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetLlmModelParts)
  @ApiOperation({
    summary: 'GetLlmModelParts',
    description: 'Get models available for a built-in provider'
  })
  @ApiOkResponse({ type: ToBackendGetLlmModelPartsResponseDto })
  async getLlmModelParts(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetLlmModelPartsRequestDto
  ): Promise<ToBackendGetLlmModelPartsResponsePayload> {
    let bodyPayload: ToBackendGetLlmModelPartsRequestPayload = body.payload;

    let { projectId, providerId } = bodyPayload;

    await this.projectsService.getProjectCheckExists({ projectId: projectId });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let provider: ProviderTab =
      await this.providersService.getProviderCheckExists({
        projectId: projectId,
        providerId: providerId
      });

    if (provider.type === ProviderTypeEnum.OpenAICompatible) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_TYPE_MISMATCH
      });
    }

    let isCodexAuthSet: boolean = isDefined(user.codexAuth);

    let modelPartsResult: LlmModelPartsResult =
      await this.llmModelService.getModelParts({
        providerType: provider.type,
        apiKey:
          provider.type === ProviderTypeEnum.OpenAICodex
            ? undefined
            : provider.options.apiKey,
        userId: user.userId,
        isCodexAuthSet: isCodexAuthSet
      });

    let payload: ToBackendGetLlmModelPartsResponsePayload = {
      modelParts: modelPartsResult.modelParts,
      errorMessage: modelPartsResult.errorMessage
    };

    return payload;
  }
}
