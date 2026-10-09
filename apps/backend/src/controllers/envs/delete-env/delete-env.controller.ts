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
  ToBackendDeleteEnvRequestDto,
  ToBackendDeleteEnvResponseDto
} from '#backend/controllers/envs/delete-env/delete-env.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetMemberCheckIsAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-admin-result-error';
import type { Env } from '#common/types/backend/parts/env';

import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendDeleteEnvOutput } from '#common/types/backend/routes/envs/delete-env/delete-env-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class DeleteEnvController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckIsAdminResultError> =>
          this.membersService.getMemberCheckIsAdminResult({
            memberId: v.userId,
            projectId: v.projectId
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
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsResultError> =>
          this.envsService.getApiEnvsResult({ projectId: v.projectId })
      ),
      Result.map(
        (v): ToBackendDeleteEnvOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          envs: v.apiEnvs
        })
      )
    );
  }
}
