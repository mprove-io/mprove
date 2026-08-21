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
  ToBackendCreateProviderRequestDto,
  ToBackendCreateProviderResponseDto
} from '#backend/controllers/providers/create-provider/create-provider.dto';
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
import { UrlService } from '#backend/services/url.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ProviderTypeEnum } from '#common/enums/provider-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty';
import type { Provider } from '#common/zod/backend/provider';
import type { ToBackendCreateProviderRequestPayload } from '#common/zod/to-backend/providers/create-provider/create-provider-request-payload';
import type { ToBackendCreateProviderResponsePayload } from '#common/zod/to-backend/providers/create-provider/create-provider-response-payload';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateProviderController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private urlService: UrlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendCreateProvider)
  @ApiOperation({
    summary: 'CreateProvider',
    description: 'Create a provider in a project'
  })
  @ApiOkResponse({
    type: ToBackendCreateProviderResponseDto
  })
  async createProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendCreateProviderRequestDto
  ) {
    let bodyPayload: ToBackendCreateProviderRequestPayload = body.payload;

    let { projectId, providerId, type, options } = bodyPayload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    if (type === ProviderTypeEnum.OpenAICompatible && 'baseURL' in options) {
      await this.urlService.checkApiUrl({
        urlStr: options.baseURL
      });
    }

    if ('apiKey' in options) {
      options.apiKey = isDefinedAndNotEmpty(options.apiKey)
        ? options.apiKey
        : undefined;
    }

    await this.providersService.checkProviderDoesNotExist({
      projectId: projectId,
      providerId: providerId
    });

    let newProvider: ProviderTab = this.providersService.makeProvider({
      ...bodyPayload,
      isEnabled: true,
      models: []
    });

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                providers: [newProvider]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let provider: Provider = this.providersService.tabToApiProvider({
      provider: newProvider,
      isIncludePasswords: false
    });

    let payload: ToBackendCreateProviderResponsePayload = {
      provider: provider
    };

    return payload;
  }
}
