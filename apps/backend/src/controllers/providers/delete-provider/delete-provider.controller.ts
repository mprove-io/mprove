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
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendDeleteProviderRequestDto,
  ToBackendDeleteProviderResponseDto
} from '#backend/controllers/providers/delete-provider/delete-provider.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { providersTable } from '#backend/drizzle/postgres/schema/providers';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { ProvidersService } from '#backend/services/db/providers/providers.service';
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
    private projectsService: ProjectsService,
    private providersService: ProvidersService,
    private membersService: MembersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.andThrough(v =>
        v.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        v.membersService.getMemberCheckIsAdminResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.andThrough(async v => {
        await retry(
          async () => {
            await v.db.drizzle.transaction(async tx => {
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
          getRetryOption(v.cs, v.logger)
        );

        return Result.succeed();
      }),
      Result.map((v): ToBackendDeleteProviderOutput => ({}))
    );
  }
}
