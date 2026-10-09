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
  ToBackendEditLlmModelRequestDto,
  ToBackendEditLlmModelResponseDto
} from '#backend/controllers/llm-models/edit-llm-model/edit-llm-model.dto';
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
import { LlmModelService } from '#backend/services/llm-model/llm-model.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty/is-undefined-or-empty';
import type { GetDiscoveredLlmModelPartResultError } from '#common/types/backend/function-errors/get-discovered-llm-model-part-result-error';
import type { GetLlmModelCheckExistsResultError } from '#common/types/backend/function-errors/get-llm-model-check-exists-result-error';
import type { GetProviderCheckExistsResultError } from '#common/types/backend/function-errors/get-provider-check-exists-result-error';
import type { ReconcileDiscoveredModelVariantsResultError } from '#common/types/backend/function-errors/reconcile-discovered-model-variants-result-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { LlmModelPart } from '#common/types/backend/parts/llm-models/llm-model-part';
import type { LlmModelVariant } from '#common/types/backend/parts/llm-models/llm-model-variant';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditLlmModelOutput } from '#common/types/backend/routes/llm-models/edit-llm-model/edit-llm-model-output';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditLlmModelController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private llmModelService: LlmModelService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendEditLlmModel' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'EditLlmModel',
    description: 'Edit a model in an existing provider'
  })
  @ApiOkResponse({ type: ToBackendEditLlmModelResponseDto })
  async editLlmModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditLlmModelRequestDto
  ): Promise<BackendResultForOperation<'editLlmModel'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        providerId: body.input.providerId,
        modelId: body.input.modelId,
        name: body.input.name,
        contextLimit: body.input.contextLimit,
        inputLimit: body.input.inputLimit,
        outputLimit: body.input.outputLimit,
        submittedVariants: body.input.variants,
        isExplorer: body.input.isExplorer,
        isBuilder: body.input.isBuilder,
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
        'model',
        (v): Result.Result<LlmModel, GetLlmModelCheckExistsResultError> =>
          this.providersService.getLlmModelCheckExistsResult({
            provider: v.provider,
            modelId: v.modelId
          })
      ),
      Result.bind(
        'isManualModel',
        (v): Result.Result<boolean, never> =>
          Result.succeed(
            v.provider.type === 'OpenAICompatible' || v.model.isManual === true
          )
      ),
      Result.bind(
        'modelPart',
        async (
          v
        ): Result.ResultAsync<
          LlmModelPart,
          GetDiscoveredLlmModelPartResultError
        > => {
          if (
            v.provider.type === 'OpenAICompatible' ||
            v.model.isManual === true
          ) {
            return Result.succeed(undefined);
          }

          return this.llmModelService.getDiscoveredLlmModelPartResult({
            providerType: v.provider.type,
            modelId: v.modelId,
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
        'variants',
        (
          v
        ): Result.Result<
          LlmModelVariant[],
          ReconcileDiscoveredModelVariantsResultError
        > =>
          isUndefined(v.modelPart)
            ? Result.succeed(v.submittedVariants)
            : this.llmModelService.reconcileDiscoveredModelVariantsResult({
                variants: v.submittedVariants,
                storedVariants: v.model.variants,
                currentVariantNames: [
                  LLM_MODEL_DEFAULT_VARIANT,
                  ...(v.modelPart.variants ?? [])
                ],
                isExplorer: v.isExplorer,
                isBuilder: v.isBuilder
              })
      ),
      Result.inspect(v => {
        if (isDefined(v.modelPart)) {
          let refreshedModel: LlmModel = {
            ...v.model,
            ...v.modelPart,
            name: v.model.name,
            isManual: false,
            variants: v.variants,
            isExplorer: v.model.isExplorer,
            isBuilder: v.model.isBuilder,
            refreshedTs: Date.now()
          };

          Object.assign(v.model, refreshedModel);
        }
      }),
      Result.andThrough(v =>
        v.isBuilder === true && v.model.isOpencodeSupported === false
          ? Result.fail({
              code: 'BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_BUILDER'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.llmModelService.validateModelVariantsResult({
          variants: v.variants,
          isExplorer: v.isExplorer,
          isBuilder: v.isBuilder
        })
      ),
      Result.inspect(v => {
        v.model.name = isUndefinedOrEmpty(v.name)
          ? capitalizeFirstLetter(v.modelId)
          : v.name;
      }),
      Result.andThrough(v =>
        v.isManualModel
          ? this.llmModelService.validateManualModelLimitsResult({
              modelInput: {
                modelId: v.model.modelId,
                name: v.model.name,
                isManual: v.model.isManual,
                contextLimit: v.contextLimit,
                inputLimit: v.inputLimit,
                outputLimit: v.outputLimit,
                isExplorer: v.isExplorer,
                isBuilder: v.isBuilder
              }
            })
          : Result.succeed()
      ),
      Result.inspect(v => {
        if (v.isManualModel) {
          v.model.contextLimit = v.contextLimit;
          v.model.inputLimit = v.inputLimit;
          v.model.outputLimit = v.outputLimit;
        }
        v.model.isExplorer = v.isExplorer;
        v.model.isBuilder = v.isBuilder;
        v.model.variants = v.variants;
      }),
      Result.andThrough(v =>
        dbErrorToResult({
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
        })
      ),
      Result.map(
        (v): ToBackendEditLlmModelOutput => ({
          provider: this.providersService.tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
