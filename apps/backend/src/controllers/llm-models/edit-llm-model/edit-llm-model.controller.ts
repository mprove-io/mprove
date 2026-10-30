import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendEditLlmModelRequestDto,
  ToBackendEditLlmModelResponseDto
} from '#backend/controllers/llm-models/edit-llm-model/edit-llm-model.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { providersTable } from '#backend/drizzle/postgres/tables/providers';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { getProviderModelCheckExists } from '#backend/functions/db/providers/get-provider-model-check-exists/get-provider-model-check-exists';
import { tabToApiProvider } from '#backend/functions/db/providers/tab-to-api-provider/tab-to-api-provider';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { LlmModelService } from '#backend/services/llm-model/llm-model.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty/is-undefined-or-empty';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditLlmModelOutput } from '#common/types/backend/routes/llm-models/edit-llm-model/edit-llm-model-output';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditLlmModelController {
  constructor(
    private llmModelService: LlmModelService,
    private db: DbService
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
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.bind('provider', v =>
        this.db.providers.findFirstCheckExists({
          where: and(
            eq(providersTable.projectId, v.projectId),
            eq(providersTable.providerId, v.providerId)
          )
        })
      ),
      Result.bind('model', v =>
        getProviderModelCheckExists({
          provider: v.provider,
          modelId: v.modelId
        })
      ),
      Result.bind('isManualModel', v =>
        Result.succeed(
          v.provider.type === 'OpenAICompatible' || v.model.isManual === true
        )
      ),
      Result.bind('modelPart', async v =>
        v.provider.type === 'OpenAICompatible' || v.model.isManual === true
          ? Result.succeed(undefined)
          : this.llmModelService.getDiscoveredLlmModelPart({
              providerType: v.provider.type,
              modelId: v.modelId,
              apiKey:
                v.provider.type === 'OpenAICodex'
                  ? undefined
                  : v.provider.options.apiKey,
              userId: v.userId,
              isCodexAuthSet: v.isCodexAuthSet,
              isForceRefresh: true
            })
      ),
      Result.bind('variants', v =>
        isUndefined(v.modelPart)
          ? Result.succeed(v.submittedVariants)
          : this.llmModelService.reconcileDiscoveredModelVariants({
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
      Result.map(v => {
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
        return v;
      }),
      Result.andThrough(v =>
        v.isBuilder === true && v.model.isOpencodeSupported === false
          ? Result.fail({
              code: 'BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_BUILDER'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.llmModelService.validateModelVariants({
          variants: v.variants,
          isExplorer: v.isExplorer,
          isBuilder: v.isBuilder
        })
      ),
      Result.map(v => {
        v.model.name = isUndefinedOrEmpty(v.name)
          ? capitalizeFirstLetter(v.modelId)
          : v.name;
        return v;
      }),
      Result.andThrough(v =>
        v.isManualModel
          ? this.llmModelService.validateManualModelLimits({
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
      Result.map(v => {
        if (v.isManualModel) {
          v.model.contextLimit = v.contextLimit;
          v.model.inputLimit = v.inputLimit;
          v.model.outputLimit = v.outputLimit;
        }
        v.model.isExplorer = v.isExplorer;
        v.model.isBuilder = v.isBuilder;
        v.model.variants = v.variants;

        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ update: { providers: [v.provider] } })
      ),
      Result.map(
        (v): ToBackendEditLlmModelOutput => ({
          provider: tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
