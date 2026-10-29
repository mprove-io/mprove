import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendDeleteEnvRequestDto,
  ToBackendDeleteEnvResponseDto
} from '#backend/controllers/envs/delete-env/delete-env.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/tables/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/tables/cached-parts';
import { envsTable } from '#backend/drizzle/postgres/tables/envs';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteEnvOutput } from '#common/types/backend/routes/envs/delete-env/delete-env-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteEnvController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  @Post('api/ToBackendDeleteEnv' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'DeleteEnv',
    description: 'Delete an environment'
  })
  @ApiOkResponse({
    type: ToBackendDeleteEnvResponseDto
  })
  async deleteEnv(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendDeleteEnvRequestDto
  ): Promise<BackendResultForOperation<'deleteEnv'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        v.envId === PROJECT_ENV_PROD
          ? Result.fail({ code: 'BACKEND_ENV_PROD_CANNOT_BE_DELETED' })
          : Result.succeed()
      ),
      Result.andThrough(async v => {
        await retry(
          async () =>
            await this.db.drizzle.transaction(async tx => {
              await tx
                .delete(envsTable)
                .where(
                  and(
                    eq(envsTable.projectId, v.projectId),
                    eq(envsTable.envId, v.envId)
                  )
                );

              await tx
                .delete(bridgesTable)
                .where(
                  and(
                    eq(bridgesTable.projectId, v.projectId),
                    eq(bridgesTable.envId, v.envId)
                  )
                );

              await tx
                .delete(cachedPartsTable)
                .where(
                  and(
                    eq(cachedPartsTable.projectId, v.projectId),
                    eq(cachedPartsTable.envId, v.envId)
                  )
                );

              await tx
                .delete(cachedColumnsTable)
                .where(
                  and(
                    eq(cachedColumnsTable.projectId, v.projectId),
                    eq(cachedColumnsTable.envId, v.envId)
                  )
                );
            }),
          getRetryOption(this.cs, this.logger)
        );
        return Result.succeed();
      }),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendDeleteEnvOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
