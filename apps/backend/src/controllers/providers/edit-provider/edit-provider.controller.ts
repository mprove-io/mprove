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
  ToBackendEditProviderRequestDto,
  ToBackendEditProviderResponseDto
} from '#backend/controllers/providers/edit-provider/edit-provider.dto';
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
import type { ToBackendEditProviderRequestPayload } from '#common/zod/to-backend/providers/edit-provider/edit-provider-request-payload';
import type { ToBackendEditProviderResponsePayload } from '#common/zod/to-backend/providers/edit-provider/edit-provider-response-payload';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditProviderController {
  constructor(
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private urlService: UrlService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendEditProvider)
  @ApiOperation({
    summary: 'EditProvider',
    description: 'Update an existing provider'
  })
  @ApiOkResponse({
    type: ToBackendEditProviderResponseDto
  })
  async editProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendEditProviderRequestDto
  ) {
    let bodyPayload: ToBackendEditProviderRequestPayload = body.payload;

    let { projectId, providerId, options } = bodyPayload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    let provider: ProviderTab =
      await this.providersService.getProviderCheckExists({
        projectId: projectId,
        providerId: providerId
      });

    if (
      provider.type === ProviderTypeEnum.OpenAICompatible &&
      'baseURL' in options &&
      'name' in bodyPayload
    ) {
      provider.name = bodyPayload.name;

      await this.urlService.checkApiUrl({
        urlStr: options.baseURL
      });

      provider.options = {
        baseURL: options.baseURL,
        apiKey: isDefinedAndNotEmpty(options.apiKey)
          ? options.apiKey
          : undefined,
        headers: options.headers,
        queryParams: options.queryParams
      };
    } else if (
      provider.type === ProviderTypeEnum.OpenAI &&
      'apiKey' in options
    ) {
      provider.options = {
        apiKey: isDefinedAndNotEmpty(options.apiKey)
          ? options.apiKey
          : undefined
      };
    } else if (
      provider.type === ProviderTypeEnum.Anthropic &&
      'apiKey' in options
    ) {
      provider.options = {
        apiKey: isDefinedAndNotEmpty(options.apiKey)
          ? options.apiKey
          : undefined
      };
    } else if (provider.type === ProviderTypeEnum.OpenAICodex) {
      provider.options = {};
    }

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              update: {
                providers: [provider]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let apiProvider: Provider = this.providersService.tabToApiProvider({
      provider: provider,
      isIncludePasswords: false
    });

    let payload: ToBackendEditProviderResponsePayload = {
      provider: apiProvider
    };

    return payload;
  }
}
