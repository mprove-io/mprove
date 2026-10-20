import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendToggleProviderRequestDto,
  ToBackendToggleProviderResponseDto
} from '#backend/controllers/providers/toggle-provider/toggle-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ProviderTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { DbProvidersFindFirstCheckExistsError } from '#common/types/backend/function-errors/db/providers/db-providers-find-first-check-exists-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendToggleProviderOutput } from '#common/types/backend/routes/providers/toggle-provider/toggle-provider-output';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class ToggleProviderController {
  constructor(
    private providersService: ProvidersService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendToggleProvider' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'ToggleProvider',
    description: 'Enable or disable an existing provider'
  })
  @ApiOkResponse({ type: ToBackendToggleProviderResponseDto })
  async toggleProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendToggleProviderRequestDto
  ): Promise<BackendResultForOperation<'toggleProvider'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        providerId: body.input.providerId,
        isEnabled: body.input.isEnabled,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'provider',
        (
          v
        ): Result.ResultAsync<
          ProviderTab,
          DbProvidersFindFirstCheckExistsError
        > =>
          this.db.providers.findFirstCheckExists({
            where: and(
              eq(providersTable.projectId, v.projectId),
              eq(providersTable.providerId, v.providerId)
            )
          })
      ),
      Result.map(v => {
        v.provider.isEnabled = v.isEnabled;
        return v;
      }),
      Result.andThrough(v =>
        this.db.write({ update: { providers: [v.provider] } })
      ),
      Result.map(
        (v): ToBackendToggleProviderOutput => ({
          provider: this.providersService.tabToApiProvider({
            provider: v.provider,
            isIncludePasswords: false
          })
        })
      )
    );
  }
}
