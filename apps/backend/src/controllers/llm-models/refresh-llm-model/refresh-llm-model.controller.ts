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
  ToBackendRefreshLlmModelRequestDto,
  ToBackendRefreshLlmModelResponseDto
} from '#backend/controllers/llm-models/refresh-llm-model/refresh-llm-model.dto';
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
import { LlmModelService } from '#backend/services/llm-model.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendRefreshLlmModelRequestPayload } from '#common/zod/to-backend/llm-models/refresh-llm-model/refresh-llm-model-request-payload';
import type { ToBackendRefreshLlmModelResponsePayload } from '#common/zod/to-backend/llm-models/refresh-llm-model/refresh-llm-model-response-payload';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RefreshLlmModelController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private llmModelService: LlmModelService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRefreshLlmModel)
  @ApiOperation({
    summary: 'RefreshLlmModel',
    description: 'Refresh information for a configured LLM model'
  })
  @ApiOkResponse({ type: ToBackendRefreshLlmModelResponseDto })
  async refreshLlmModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRefreshLlmModelRequestDto
  ): Promise<ToBackendRefreshLlmModelResponsePayload> {
    let bodyPayload: ToBackendRefreshLlmModelRequestPayload = body.payload;

    let { projectId, providerId, modelId } = bodyPayload;

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

    let model: LlmModel = this.providersService.getModelCheckExists({
      provider: provider,
      modelId: modelId
    });

    let isCodexAuthSet: boolean = isDefined(user.codexAuth);

    let refreshedModel: LlmModel = await this.llmModelService.refreshModel({
      providerType: provider.type,
      apiKey:
        provider.type === ProviderTypeEnum.OpenAICodex
          ? undefined
          : provider.options.apiKey,
      userId: user.userId,
      isCodexAuthSet: isCodexAuthSet,
      modelInput: {
        modelId: model.modelId,
        name: model.name,
        isManual: model.isManual,
        contextLimit: model.contextLimit,
        inputLimit: model.inputLimit,
        outputLimit: model.outputLimit,
        isExplorer: model.isExplorer,
        isBuilder: model.isBuilder
      },
      isForceRefresh: true
    });

    refreshedModel.isExplorer = model.isExplorer;

    refreshedModel.isBuilder =
      model.isBuilder && refreshedModel.isOpencodeSupported;

    let modelIndex: number = provider.models.findIndex(
      item => item.modelId === modelId
    );

    provider.models[modelIndex] = refreshedModel;

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

    let apiProvider: Provider = this.providersService.tabToApiProvider({
      provider: provider,
      isIncludePasswords: false
    });

    let payload: ToBackendRefreshLlmModelResponsePayload = {
      provider: apiProvider
    };

    return payload;
  }
}
