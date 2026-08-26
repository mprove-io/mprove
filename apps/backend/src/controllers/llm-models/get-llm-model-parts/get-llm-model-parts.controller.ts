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
import retry from 'async-retry';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetLlmModelPartsRequestDto,
  ToBackendGetLlmModelPartsResponseDto
} from '#backend/controllers/llm-models/get-llm-model-parts/get-llm-model-parts.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import {
  type LlmModelPartsResult,
  LlmModelService
} from '#backend/services/llm-model.service';
import { LLM_MODEL_DEFAULT_VARIANT } from '#common/constants/llm-models';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ErEnum } from '#common/enums/er.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ServerError } from '#common/models/server-error';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { LlmModelPart } from '#common/zod/backend/llm-models/llm-model-part';
import type { LlmModelVariant } from '#common/zod/backend/llm-models/llm-model-variant';
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
    private llmModelService: LlmModelService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        isCodexAuthSet: isCodexAuthSet,
        isForceRefresh: true
      });

    let modelPartsById: Map<string, LlmModelPart> = new Map(
      modelPartsResult.modelParts.map(modelPart => [
        modelPart.modelId,
        modelPart
      ])
    );

    let hasProviderChanges: boolean = false;

    provider.models.forEach((model, modelIndex) => {
      if (model.isManual === true) {
        return;
      }

      let modelPart: LlmModelPart | undefined = modelPartsById.get(
        model.modelId
      );

      if (!isDefined(modelPart)) {
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

      let refreshedIsBuilder: boolean =
        modelPart.isOpencodeSupported === false ? false : model.isBuilder;

      let syncedVariants: LlmModelVariant[] =
        this.llmModelService.syncDiscoveredModelVariants({
          variants: sourceVariants,
          currentVariantNames: currentVariantNames,
          isExplorer: model.isExplorer,
          isBuilder: refreshedIsBuilder
        });

      let refreshedModel: LlmModel = {
        ...model,
        ...modelPart,
        name: model.name,
        isManual: false,
        variants: syncedVariants,
        isExplorer: model.isExplorer,
        isBuilder: refreshedIsBuilder,
        refreshedTs: Date.now()
      };

      provider.models[modelIndex] = refreshedModel;

      hasProviderChanges = true;
    });

    if (hasProviderChanges) {
      await retry(
        async () =>
          await this.db.drizzle.transaction(
            async tx =>
              await this.db.packer.write({
                tx: tx,
                update: { providers: [provider] }
              })
          ),
        getRetryOption(this.cs, this.logger)
      );
    }

    let payload: ToBackendGetLlmModelPartsResponsePayload = {
      modelParts: modelPartsResult.modelParts,
      errorMessage: modelPartsResult.errorMessage
    };

    return payload;
  }
}
