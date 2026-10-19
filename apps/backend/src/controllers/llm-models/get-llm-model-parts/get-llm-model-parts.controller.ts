import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetLlmModelPartsRequestDto,
  ToBackendGetLlmModelPartsResponseDto
} from '#backend/controllers/llm-models/get-llm-model-parts/get-llm-model-parts.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import {
  type LlmModelPartsResult,
  LlmModelService
} from '#backend/services/llm-model/llm-model.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendProviderTypeMismatchError } from '#common/types/backend/errors/backend-provider-type-mismatch-error';
import type { GetModelPartsError } from '#common/types/backend/function-errors/get-model-parts-error';
import type { GetProviderCheckExistsError } from '#common/types/backend/function-errors/get-provider-check-exists-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { LlmModelPart } from '#common/types/backend/parts/llm-models/llm-model-part';
import type { LlmModelVariant } from '#common/types/backend/parts/llm-models/llm-model-variant';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetLlmModelPartsOutput } from '#common/types/backend/routes/llm-models/get-llm-model-parts/get-llm-model-parts-output';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetLlmModelPartsController {
  constructor(
    private membersService: MembersService,
    private llmModelService: LlmModelService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetLlmModelParts' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetLlmModelParts',
    description: 'Get models available for a built-in provider'
  })
  @ApiOkResponse({ type: ToBackendGetLlmModelPartsResponseDto })
  async getLlmModelParts(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetLlmModelPartsRequestDto
  ): Promise<BackendResultForOperation<'getLlmModelParts'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        providerId: body.input.providerId,
        userId: user.userId,
        isCodexAuthSet: isDefined(user.codexAuth)
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'provider',
        (v): Result.ResultAsync<ProviderTab, GetProviderCheckExistsError> =>
          this.db.providers.findFirstCheckExists({
            where: and(
              eq(providersTable.projectId, v.projectId),
              eq(providersTable.providerId, v.providerId)
            )
          })
      ),
      Result.bind(
        'modelPartsResult',
        async (
          v
        ): Result.ResultAsync<
          LlmModelPartsResult,
          GetModelPartsError | BackendProviderTypeMismatchError
        > =>
          v.provider.type === 'OpenAICompatible'
            ? Result.fail({ code: 'BACKEND_PROVIDER_TYPE_MISMATCH' })
            : this.llmModelService.getModelParts({
                providerType: v.provider.type,
                apiKey:
                  v.provider.type === 'OpenAICodex'
                    ? undefined
                    : v.provider.options.apiKey,
                userId: v.userId,
                isCodexAuthSet: v.isCodexAuthSet,
                isForceRefresh: true
              })
      ),
      Result.bind(
        'modelPartsById',
        (v): Result.Result<Map<string, LlmModelPart>, never> =>
          Result.succeed(
            new Map(
              v.modelPartsResult.modelParts.map(modelPart => [
                modelPart.modelId,
                modelPart
              ])
            )
          )
      ),
      Result.bind('isProviderChanged', (v): Result.Result<boolean, never> => {
        let isProviderChanged: boolean = false;

        v.provider.models.forEach((model, modelIndex) => {
          if (model.isManual === true) {
            return;
          }

          let modelPart: LlmModelPart = v.modelPartsById.get(model.modelId);

          if (isUndefined(modelPart)) {
            return;
          }

          let currentVariantNames: string[] = [
            LLM_MODEL_DEFAULT_VARIANT,
            ...(modelPart.variants ?? [])
          ];

          let sourceVariants: LlmModelVariant[] =
            modelPart.isOpencodeSupported === false
              ? model.variants.map(variant => ({
                  variant: variant.variant,
                  isExplorer: variant.isExplorer,
                  isExplorerRecommended: variant.isExplorerRecommended,
                  isBuilder: false,
                  isBuilderRecommended: false
                }))
              : model.variants;

          let isRefreshedBuilder: boolean =
            modelPart.isOpencodeSupported === false ? false : model.isBuilder;

          let syncedVariants: LlmModelVariant[] =
            this.llmModelService.syncDiscoveredModelVariants({
              variants: sourceVariants,
              currentVariantNames: currentVariantNames,
              isExplorer: model.isExplorer,
              isBuilder: isRefreshedBuilder
            });

          let refreshedModel: LlmModel = {
            ...model,
            ...modelPart,
            name: model.name,
            isManual: false,
            variants: syncedVariants,
            isExplorer: model.isExplorer,
            isBuilder: isRefreshedBuilder,
            refreshedTs: Date.now()
          };

          v.provider.models[modelIndex] = refreshedModel;

          isProviderChanged = true;
        });

        return Result.succeed(isProviderChanged);
      }),
      Result.andThrough(async v =>
        v.isProviderChanged
          ? this.db.write({ update: { providers: [v.provider] } })
          : Result.succeed()
      ),
      Result.map(
        (v): ToBackendGetLlmModelPartsOutput => ({
          modelParts: v.modelPartsResult.modelParts,
          errorMessage: v.modelPartsResult.errorMessage
        })
      )
    );
  }
}
