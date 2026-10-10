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
  ToBackendToggleProviderRequestDto,
  ToBackendToggleProviderResponseDto
} from '#backend/controllers/providers/toggle-provider/toggle-provider.dto';
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
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetProviderCheckExistsResultError } from '#common/types/backend/function-errors/get-provider-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendToggleProviderOutput } from '#common/types/backend/routes/providers/toggle-provider/toggle-provider-output';

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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsAdminResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'provider',
        (
          v
        ): Result.ResultAsync<ProviderTab, GetProviderCheckExistsResultError> =>
          this.providersService.getProviderCheckExistsResult({
            projectId: v.projectId,
            providerId: v.providerId
          })
      ),
      Result.map(v => {
        v.provider.isEnabled = v.isEnabled;
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
