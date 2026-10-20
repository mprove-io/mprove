import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendCreateLlmModelRequestDto,
  ToBackendCreateLlmModelResponseDto
} from '#backend/controllers/llm-models/create-llm-model/create-llm-model.dto';
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
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { LlmModelService } from '#backend/services/llm-model/llm-model.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty/is-undefined-or-empty';
import type { DbProvidersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/providers/db-providers-find-first-check-exists-error';
import type { RefreshModelError } from '#common/types/backend/function-errors/refresh-model-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateLlmModelOutput } from '#common/types/backend/routes/llm-models/create-llm-model/create-llm-model-output';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateLlmModelController {
  constructor(
    private providersService: ProvidersService,
    private membersService: MembersService,
    private llmModelService: LlmModelService,
    private db: DbService
  ) {}

  @Post('api/ToBackendCreateLlmModel' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'CreateLlmModel',
    description: 'Create a model in an existing provider'
  })
  @ApiOkResponse({ type: ToBackendCreateLlmModelResponseDto })
  async createLlmModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateLlmModelRequestDto
  ): Promise<BackendResultForOperation<'createLlmModel'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        providerId: body.input.providerId,
        modelId: body.input.modelId,
        name: body.input.name,
        isManual: body.input.isManual,
        contextLimit: body.input.contextLimit,
        inputLimit: body.input.inputLimit,
        outputLimit: body.input.outputLimit,
        variants: body.input.variants,
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
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'provider',
        (
          v
        ): Result.ResultAsync<
          ProviderTab,
          DbProvidersFindFirstCheckExistsError
        > =>
          this.db.providers.findFirstCheckExists({
            where: and(
              eq(providersTable.projectId, v.projectId),
              eq(providersTable.providerId, v.providerId)
            )
          })
      ),
      Result.andThrough(v =>
        this.providersService.checkLlmModelDoesNotExist({
          provider: v.provider,
          modelId: v.modelId
        })
      ),
      Result.bind(
        'model',
        (v): Result.ResultAsync<LlmModel, RefreshModelError> =>
          this.llmModelService.refreshModel({
            providerType: v.provider.type,
            apiKey:
              v.provider.type === 'OpenAICodex'
                ? undefined
                : v.provider.options.apiKey,
            userId: v.userId,
            isCodexAuthSet: v.isCodexAuthSet,
            variants: v.variants,
            modelInput: {
              modelId: v.modelId,
              name: isUndefinedOrEmpty(v.name)
                ? capitalizeFirstLetter(v.modelId)
                : v.name,
              isManual:
                v.provider.type === 'OpenAICodex' && v.isManual === true,
              contextLimit: v.contextLimit,
              inputLimit: v.inputLimit,
              outputLimit: v.outputLimit,
              isExplorer: v.isExplorer,
              isBuilder: v.isBuilder
            }
          })
      ),
      Result.andThrough(v =>
        v.isBuilder === true && v.model.isOpencodeSupported === false
          ? Result.fail({
              code: 'BACKEND_LLM_MODEL_NOT_AVAILABLE_IN_BUILDER'
            })
          : Result.succeed()
      ),
      Result.map(v => {
        v.provider.models.push(v.model);
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ update: { providers: [v.provider] } })
      ),
      Result.map(
        (v): ToBackendCreateLlmModelOutput => ({
          provider: this.providersService.tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
