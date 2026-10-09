import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import {
  ToBackendGetLlmModelsWithProviderRequestDto,
  ToBackendGetLlmModelsWithProviderResponseDto
} from '#backend/controllers/llm-models/get-llm-models-with-provider/get-llm-models-with-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetEnabledProvidersResultError } from '#common/types/backend/function-errors/get-enabled-providers-result-error';
import type { LlmModelWithProvider } from '#common/types/backend/parts/llm-models/llm-model-with-provider';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetLlmModelsWithProviderOutput } from '#common/types/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-output';

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

  @Post('api/ToBackendGetLlmModelsWithProvider' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'getLlmModelsWithProvider'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        sessionTypes: body.input.sessionTypes,
        userId: user.userId,
        isUserCodexAuthSet: isDefined(user.codexAuth)
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckExistsResult({
          projectId: v.projectId,
          memberId: v.userId
        })
      ),
      Result.bind(
        'providers',
        (
          v
        ): Result.ResultAsync<ProviderTab[], GetEnabledProvidersResultError> =>
          this.providersService.getEnabledProvidersResult({
            projectId: v.projectId
          })
      ),
      Result.bind(
        'visibleProviders',
        (v): Result.Result<ProviderTab[], never> =>
          Result.succeed(
            v.providers.filter(
              provider =>
                provider.type !== 'OpenAICodex' || v.isUserCodexAuthSet
            )
          )
      ),
      Result.bind(
        'allModels',
        (v): Result.Result<LlmModelWithProvider[], never> =>
          Result.succeed(
            v.visibleProviders.flatMap(provider =>
              provider.models.map(model => ({
                ...model,
                providerId: provider.providerId,
                providerName: provider.name
              }))
            )
          )
      ),
      Result.map(
        (v): ToBackendGetLlmModelsWithProviderOutput => ({
          modelsAi: v.sessionTypes.includes('Explorer')
            ? v.allModels
                .filter(model => model.isExplorer)
                .map(model => ({
                  ...model,
                  variants: model.variants.filter(variant => variant.isExplorer)
                }))
            : [],
          modelsOpencode: v.sessionTypes.includes('Editor')
            ? v.allModels
                .filter(model => model.isOpencodeSupported && model.isBuilder)
                .map(model => ({
                  ...model,
                  variants: model.variants.filter(variant => variant.isBuilder)
                }))
            : []
        })
      )
    );
  }
}
