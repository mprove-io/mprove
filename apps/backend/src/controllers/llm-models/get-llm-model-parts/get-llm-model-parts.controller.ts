import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetLlmModelPartsRequestDto,
  ToBackendGetLlmModelPartsResponseDto
} from '#backend/controllers/llm-models/get-llm-model-parts/get-llm-model-parts.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
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
import type { GetModelPartsResultError } from '#common/types/backend/function-errors/get-model-parts-result-error';
import type { GetProviderCheckExistsResultError } from '#common/types/backend/function-errors/get-provider-check-exists-result-error';
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
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private llmModelService: LlmModelService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdminResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'provider',
        (
          v
        ): Result.ResultAsync<ProviderTab, GetProviderCheckExistsResultError> =>
          this.providersService.getProviderCheckExistsResult({
            projectId: v.projectId,
            providerId: v.providerId
          })
      ),
      Result.bind(
        'modelPartsResult',
        async (
          v
        ): Result.ResultAsync<
          LlmModelPartsResult,
          GetModelPartsResultError | BackendProviderTypeMismatchError
        > => {
          if (v.provider.type === 'OpenAICompatible') {
            return Result.fail({ code: 'BACKEND_PROVIDER_TYPE_MISMATCH' });
          }

          return this.llmModelService.getModelPartsResult({
            providerType: v.provider.type,
            apiKey:
              v.provider.type === 'OpenAICodex'
                ? undefined
                : v.provider.options.apiKey,
            userId: v.userId,
            isCodexAuthSet: v.isCodexAuthSet,
            isForceRefresh: true
          });
        }
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
      Result.andThrough(async v => {
        if (v.isProviderChanged) {
          return dbErrorToResult({
            action: async () => {
              await retry(
                async () =>
                  await this.db.drizzle.transaction(
                    async tx =>
                      await this.db.packer.write({
                        tx: tx,
                        update: { providers: [v.provider] }
                      })
                  ),
                getRetryOption(this.cs, this.logger)
              );
            }
          });
        }

        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendGetLlmModelPartsOutput => ({
          modelParts: v.modelPartsResult.modelParts,
          errorMessage: v.modelPartsResult.errorMessage
        })
      )
    );
  }
}
