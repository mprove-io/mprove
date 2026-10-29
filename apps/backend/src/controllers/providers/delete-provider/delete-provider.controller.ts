import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendDeleteProviderRequestDto,
  ToBackendDeleteProviderResponseDto
} from '#backend/controllers/providers/delete-provider/delete-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { providersTable } from '#backend/drizzle/postgres/tables/providers';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteProviderOutput } from '#common/types/backend/routes/providers/delete-provider/delete-provider-output';

@ApiTags('Providers')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteProviderController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteProvider' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteProvider',
    description: 'Delete a provider from a project'
  })
  @ApiOkResponse({
    type: ToBackendDeleteProviderResponseDto
  })
  async deleteProvider(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteProviderRequestDto
  ): Promise<BackendResultForOperation<'deleteProvider'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        providerId: body.input.providerId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(async v => {
        await retry(
          async () => {
            await this.db.drizzle.transaction(async tx => {
              await tx
                .delete(providersTable)
                .where(
                  and(
                    eq(providersTable.projectId, v.projectId),
                    eq(providersTable.providerId, v.providerId)
                  )
                );
            });
          },
          getRetryOption(this.cs, this.logger)
        );

        return Result.succeed();
      }),
      Result.map((v): ToBackendDeleteProviderOutput => ({}))
    );
  }
}
