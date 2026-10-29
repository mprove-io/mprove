import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  type ToBackendEditProviderRequestDto,
  ToBackendEditProviderResponseDto
} from '#backend/controllers/providers/edit-provider/edit-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { providersTable } from '#backend/drizzle/postgres/tables/providers';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { tabToApiProvider } from '#backend/functions/db/providers/tab-to-api-provider/tab-to-api-provider';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { UrlService } from '#backend/services/url/url.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendEditProviderOutput } from '#common/types/backend/routes/providers/edit-provider/edit-provider-output';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class EditProviderController {
  constructor(
    private urlService: UrlService,
    private db: DbService
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
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.input.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.input.projectId,
          db: this.db
        })
      ),
      Result.bind('provider', v =>
        this.db.providers.findFirstCheckExists({
          where: and(
            eq(providersTable.projectId, v.input.projectId),
            eq(providersTable.providerId, v.input.providerId)
          )
        })
      ),
      Result.andThrough(v => {
        if (
          v.provider.type === 'OpenAICompatible' &&
          'baseURL' in v.input.options &&
          'name' in v.input
        ) {
          v.provider.name = v.input.name;

          return this.urlService.checkApiUrl({
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
        this.db.write({ update: { providers: [v.provider] } })
      ),
      Result.map(
        (v): ToBackendEditProviderOutput => ({
          provider: tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
