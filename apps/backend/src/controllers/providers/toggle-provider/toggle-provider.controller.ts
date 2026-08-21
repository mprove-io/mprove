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
  ToBackendToggleProviderRequestDto,
  ToBackendToggleProviderResponseDto
} from '#backend/controllers/providers/toggle-provider/toggle-provider.dto';
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
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendToggleProviderRequestPayload } from '#common/zod/to-backend/providers/toggle-provider/toggle-provider-request-payload';
import type { ToBackendToggleProviderResponsePayload } from '#common/zod/to-backend/providers/toggle-provider/toggle-provider-response-payload';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ToggleProviderController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendToggleProvider)
  @ApiOperation({
    summary: 'ToggleProvider',
    description: 'Enable or disable an existing provider'
  })
  @ApiOkResponse({ type: ToBackendToggleProviderResponseDto })
  async toggleProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendToggleProviderRequestDto
  ) {
    let bodyPayload: ToBackendToggleProviderRequestPayload = body.payload;

    let { projectId, providerId, isEnabled } = bodyPayload;

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

    provider.isEnabled = isEnabled;

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

    let payload: ToBackendToggleProviderResponsePayload = {
      provider: apiProvider
    };

    return payload;
  }
}
