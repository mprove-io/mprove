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
  ToBackendCreateProviderRequestDto,
  ToBackendCreateProviderResponseDto
} from '#backend/controllers/providers/create-provider/create-provider.dto';
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
import type { MakeProviderResultError } from '#common/types/backend/function-errors/make-provider-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateProviderOutput } from '#common/types/backend/routes/providers/create-provider/create-provider-output';

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

  @Post('api/ToBackendCreateProvider' satisfies ToBackendRoute)
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
  ): Promise<BackendResultForOperation<'createProvider'>> {
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
      Result.andThrough(v =>
        v.input.type === 'OpenAICompatible' && 'baseURL' in v.input.options
          ? this.urlService.checkApiUrlResult({
              urlStr: v.input.options.baseURL
            })
          : Result.succeed()
      ),
      Result.map(v => {
        if ('apiKey' in v.input.options) {
          v.input.options.apiKey = isDefinedAndNotEmpty(v.input.options.apiKey)
            ? v.input.options.apiKey
            : undefined;
        }
        return v;
      }),
      Result.andThrough(v =>
        this.providersService.checkProviderDoesNotExistResult({
          projectId: v.input.projectId,
          providerId: v.input.providerId
        })
      ),
      Result.bind(
        'provider',
        (v): Result.Result<ProviderTab, MakeProviderResultError> =>
          this.providersService.makeProviderResult({
            ...v.input,
            isEnabled: true,
            models: []
          })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await this.db.drizzle.transaction(
                  async tx =>
                    await this.db.packer.write({
                      tx: tx,
                      insert: { providers: [v.provider] }
                    })
                ),
              getRetryOption(this.cs, this.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendCreateProviderOutput => ({
          provider: this.providersService.tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
