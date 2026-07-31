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
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteProviderModelRequestDto,
  ToBackendDeleteProviderModelResponseDto
} from '#backend/controllers/providers/delete-provider-model/delete-provider-model.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { ProvidersService } from '#backend/services/db/providers.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendDeleteProviderModelResponsePayload } from '#common/zod/to-backend/providers/to-backend-delete-provider-model';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteProviderModelController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendDeleteProviderModel)
  @ApiOperation({
    summary: 'DeleteProviderModel',
    description: 'Delete a model from an existing provider'
  })
  @ApiOkResponse({ type: ToBackendDeleteProviderModelResponseDto })
  async deleteProviderModel(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteProviderModelRequestDto
  ) {
    let { projectId, providerId, modelId } = body.payload;

    await this.projectsService.getProjectCheckExists({ projectId: projectId });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let provider = await this.providersService.getProviderCheckExists({
      projectId: projectId,
      providerId: providerId
    });

    this.providersService.getProviderModelCheckExists({
      provider: provider,
      modelId: modelId
    });

    provider.options.models = provider.options.models.filter(
      x => x.modelId !== modelId
    );

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

    let payload: ToBackendDeleteProviderModelResponsePayload = {
      provider: this.providersService.tabToApiProvider({
        provider: provider,
        isIncludePasswords: false
      })
    };

    return payload;
  }
}
