import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetLlmModelsWithProviderRequestDto,
  ToBackendGetLlmModelsWithProviderResponseDto
} from '#backend/controllers/llm-models/get-llm-models-with-provider/get-llm-models-with-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetEnabledProvidersError } from '#common/types/backend/function-errors/get-enabled-providers-error';
import type { LlmModelWithProvider } from '#common/types/backend/parts/llm-models/llm-model-with-provider';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetLlmModelsWithProviderOutput } from '#common/types/backend/routes/llm-models/get-llm-models-with-provider/get-llm-models-with-provider-output';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetLlmModelsWithProviderController {
  constructor(private db: DbService) {}

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
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind(
        'providers',
        (v): Result.ResultAsync<ProviderTab[], GetEnabledProvidersError> =>
          this.db.providers.findMany({
            where: and(
              eq(providersTable.projectId, v.projectId),
              eq(providersTable.isEnabled, true)
            )
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
