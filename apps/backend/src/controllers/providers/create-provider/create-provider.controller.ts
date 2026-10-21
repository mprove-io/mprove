import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendCreateProviderRequestDto,
  ToBackendCreateProviderResponseDto
} from '#backend/controllers/providers/create-provider/create-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import { UrlService } from '#backend/services/url/url.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isDefinedAndNotEmpty } from '#common/functions/is-defined-and-not-empty/is-defined-and-not-empty';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendCreateProviderOutput } from '#common/types/backend/routes/providers/create-provider/create-provider-output';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class CreateProviderController {
  constructor(
    private providersService: ProvidersService,
    private membersService: MembersService,
    private urlService: UrlService,
    private db: DbService
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
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.input.projectId)
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.input.projectId
        })
      ),
      Result.andThrough(v =>
        v.input.type === 'OpenAICompatible' && 'baseURL' in v.input.options
          ? this.urlService.checkApiUrl({
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
        this.providersService.checkProviderDoesNotExist({
          projectId: v.input.projectId,
          providerId: v.input.providerId
        })
      ),
      Result.bind('provider', v =>
        this.providersService.makeProvider({
          ...v.input,
          isEnabled: true,
          models: []
        })
      ),
      Result.andThrough(v =>
        this.db.write({ insert: { providers: [v.provider] } })
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
