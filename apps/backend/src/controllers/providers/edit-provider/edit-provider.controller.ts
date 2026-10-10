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
  ToBackendEditProviderRequestDto,
  ToBackendEditProviderResponseDto
} from '#backend/controllers/providers/edit-provider/edit-provider.dto';
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
import { UrlService } from '#backend/services/url/url.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';

import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { GetProviderCheckExistsResultError } from '#common/types/backend/function-errors/get-provider-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditProviderOutput } from '#common/types/backend/routes/providers/edit-provider/edit-provider-output';

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

  @Post('api/ToBackendEditProvider' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'editProvider'>> {
    return Result.pipe(
      Result.succeed({
        input: body.input,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.input.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdminResult({
          memberId: v.userId,
          projectId: v.input.projectId
        })
      ),
      Result.bind(
        'provider',
        (
          v
        ): Result.ResultAsync<ProviderTab, GetProviderCheckExistsResultError> =>
          this.providersService.getProviderCheckExistsResult({
            projectId: v.input.projectId,
            providerId: v.input.providerId
          })
      ),
      Result.andThrough(v => {
        if (
          v.provider.type === 'OpenAICompatible' &&
          'baseURL' in v.input.options &&
          'name' in v.input
        ) {
          v.provider.name = v.input.name;

          return this.urlService.checkApiUrlResult({
            urlStr: v.input.options.baseURL
          });
        }

        return Result.succeed();
      }),
      Result.map(v => {
        if (
          v.provider.type === 'OpenAICompatible' &&
          'baseURL' in v.input.options &&
          'name' in v.input
        ) {
          v.provider.options = {
            baseURL: v.input.options.baseURL,
            apiKey: isDefinedAndNotEmpty(v.input.options.apiKey)
              ? v.input.options.apiKey
              : undefined,
            headers: v.input.options.headers,
            queryParams: v.input.options.queryParams
          };
        } else if (
          v.provider.type === 'OpenAI' &&
          'apiKey' in v.input.options
        ) {
          v.provider.options = {
            apiKey: isDefinedAndNotEmpty(v.input.options.apiKey)
              ? v.input.options.apiKey
              : undefined
          };
        } else if (
          v.provider.type === 'Anthropic' &&
          'apiKey' in v.input.options
        ) {
          v.provider.options = {
            apiKey: isDefinedAndNotEmpty(v.input.options.apiKey)
              ? v.input.options.apiKey
              : undefined
          };
        } else if (v.provider.type === 'OpenAICodex') {
          v.provider.options = {};
        }
        return v;
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
        (v): ToBackendEditProviderOutput => ({
          provider: this.providersService.tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
