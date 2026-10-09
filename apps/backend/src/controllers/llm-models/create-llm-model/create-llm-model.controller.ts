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
  ToBackendCreateLlmModelRequestDto,
  ToBackendCreateLlmModelResponseDto
} from '#backend/controllers/llm-models/create-llm-model/create-llm-model.dto';
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
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty/is-undefined-or-empty';
import type { GetProviderCheckExistsResultError } from '#common/types/backend/function-errors/get-provider-check-exists-result-error';
import type { RefreshModelResultError } from '#common/types/backend/function-errors/refresh-model-result-error';
import type { LlmModel } from '#common/types/backend/parts/llm-models/llm-model';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateLlmModelOutput } from '#common/types/backend/routes/llm-models/create-llm-model/create-llm-model-output';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateLlmModelController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private llmModelService: LlmModelService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
      Result.andThrough(v =>
        this.providersService.checkLlmModelDoesNotExistResult({
          provider: v.provider,
          modelId: v.modelId
        })
      ),
      Result.bind(
        'model',
        (v): Result.ResultAsync<LlmModel, RefreshModelResultError> =>
          this.llmModelService.refreshModelResult({
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
      Result.inspect(v => {
        v.provider.models.push(v.model);
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
