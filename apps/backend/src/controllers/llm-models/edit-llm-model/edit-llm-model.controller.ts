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
  ToBackendEditLlmModelRequestDto,
  ToBackendEditLlmModelResponseDto
} from '#backend/controllers/llm-models/edit-llm-model/edit-llm-model.dto';
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
import { isUndefinedOrEmpty } from '#common/functions/is-undefined-or-empty';
import { ServerError } from '#common/models/server-error';
import type { LlmModel } from '#common/zod/backend/llm-models/llm-model';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendEditLlmModelRequestPayload } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-request-payload';
import type { ToBackendEditLlmModelResponsePayload } from '#common/zod/to-backend/llm-models/edit-llm-model/edit-llm-model-response-payload';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditLlmModel)
  @ApiOperation({
    summary: 'EditLlmModel',
    description: 'Edit a model in an existing provider'
  })
  @ApiOkResponse({ type: ToBackendEditLlmModelResponseDto })
  async editLlmModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditLlmModelRequestDto
  ): Promise<ToBackendEditLlmModelResponsePayload> {
    let bodyPayload: ToBackendEditLlmModelRequestPayload = body.payload;

    let {
      projectId,
      providerId,
      modelId,
      name,
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

    let model: LlmModel = this.providersService.getModelCheckExists({
      provider: provider,
      modelId: modelId
    });

    if (isBuilder === true && model.isOpencodeSupported === false) {
      throw new ServerError({
        message: ErEnum.BACKEND_PROVIDER_MODEL_NOT_AVAILABLE_IN_BUILDER
      });
    }

    model.name = isUndefinedOrEmpty(name)
      ? capitalizeFirstLetter(modelId)
      : name;

    let isManualModel: boolean =
      provider.type === ProviderTypeEnum.OpenAICompatible ||
      model.isManual === true;

    if (isManualModel) {
      this.llmModelService.validateManualModelLimits({
        modelInput: {
          modelId: model.modelId,
          name: model.name,
          isManual: model.isManual,
          contextLimit: contextLimit,
          inputLimit: inputLimit,
          outputLimit: outputLimit,
          isExplorer: isExplorer,
          isBuilder: isBuilder
        }
      });

      model.contextLimit = contextLimit;

      model.inputLimit = inputLimit;

      model.outputLimit = outputLimit;
    }

    model.isExplorer = isExplorer;

    model.isBuilder = isBuilder;

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

    let payload: ToBackendEditLlmModelResponsePayload = {
      provider: apiProvider
    };

    return payload;
  }
}
