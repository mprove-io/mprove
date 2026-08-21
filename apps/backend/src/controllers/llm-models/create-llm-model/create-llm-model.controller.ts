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
  ToBackendCreateLlmModelRequestDto,
  ToBackendCreateLlmModelResponseDto
} from '#backend/controllers/llm-models/create-llm-model/create-llm-model.dto';
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
import { ErEnum } from '#common/enums/er.enum';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { capitalizeFirstLetter } from '#common/functions/capitalize-first-letter';
import { isDefined } from '#common/functions/is-defined';
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty';
import { ServerError } from '#common/models/server-error';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendCreateLlmModelRequestPayload } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-request-payload';
import type { ToBackendCreateLlmModelResponsePayload } from '#common/zod/to-backend/llm-models/create-llm-model/create-llm-model-response-payload';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel)
  @ApiOperation({
    summary: 'CreateLlmModel',
    description: 'Create a model in an existing provider'
  })
  @ApiOkResponse({ type: ToBackendCreateLlmModelResponseDto })
  async createLlmModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateLlmModelRequestDto
  ): Promise<ToBackendCreateLlmModelResponsePayload> {
    let bodyPayload: ToBackendCreateLlmModelRequestPayload = body.payload;

    let {
      projectId,
      providerId,
      modelId,
      name,
      isManual,
      contextLimit,
      inputLimit,
      outputLimit,
      isExplorer,
      isBuilder
    } = bodyPayload;

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

    this.providersService.checkModelDoesNotExist({
      provider: provider,
      modelId: modelId
    });

    let modelName: string = isUndefinedOrEmpty(name)
      ? capitalizeFirstLetter(modelId)
      : name;

    let isCodexAuthSet: boolean = isDefined(user.codexAuth);

    let model: LlmModel = await this.llmModelService.refreshModel({
      providerType: provider.type,
      apiKey:
        provider.type === ProviderTypeEnum.OpenAICodex
          ? undefined
          : provider.options.apiKey,
      userId: user.userId,
      isCodexAuthSet: isCodexAuthSet,
      modelInput: {
        modelId: modelId,
        name: modelName,
        isManual:
          provider.type === ProviderTypeEnum.OpenAICodex && isManual === true,
        contextLimit: contextLimit,
        inputLimit: inputLimit,
        outputLimit: outputLimit,
        isExplorer: isExplorer,
        isBuilder: isBuilder
      }
    });

    if (isBuilder === true && model.isOpencodeSupported === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_BUILDER
      });
    }

    provider.models.push(model);

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

    let payload: ToBackendCreateLlmModelResponsePayload = {
      provider: apiProvider
    };

    return payload;
  }
}
