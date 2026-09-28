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
  ToBackendDeleteLlmModelRequestDto,
  ToBackendDeleteLlmModelResponseDto
} from '#backend/controllers/llm-models/delete-llm-model/delete-llm-model.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendDeleteLlmModelOutput } from '#common/zod/backend/routes/llm-models/delete-llm-model/delete-llm-model-output';
import type { ToBackendDeleteLlmModelRequest } from '#common/zod/backend/routes/llm-models/delete-llm-model/delete-llm-model-request';

@ApiTags('LlmModels')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteLlmModelController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendDeleteLlmModel' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteLlmModel',
    description: 'Delete a model from an existing provider'
  })
  @ApiOkResponse({ type: ToBackendDeleteLlmModelResponseDto })
  async deleteLlmModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteLlmModelRequestDto
  ): Promise<ToBackendDeleteLlmModelOutput> {
    let bodyPayload: ToBackendDeleteLlmModelRequest['input'] = body.input;

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

    this.providersService.getModelCheckExists({
      provider: provider,
      modelId: modelId
    });

    provider.models = provider.models.filter(x => x.modelId !== modelId);

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

    let payload: ToBackendDeleteLlmModelOutput = {
      provider: apiProvider
    };

    return payload;
  }
}
