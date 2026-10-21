import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetEnvsListRequestDto,
  ToBackendGetEnvsListResponseDto
} from '#backend/controllers/envs/get-envs-list/get-envs-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetEnvsListOutput } from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetEnvsListController {
  constructor(
    private envsService: EnvsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetEnvsList' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetEnvsList',
    description: 'Get a list of project environments'
  })
  @ApiOkResponse({
    type: ToBackendGetEnvsListResponseDto
  })
  async getEnvsList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetEnvsListRequestDto
  ): Promise<BackendResultForOperation<'getEnvsList'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        isFilter: body.input.isFilter,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.bind('envs', v =>
        this.db.envs.findMany({
          where: eq(envsTable.projectId, v.projectId)
        })
      ),
      Result.bind('visibleEnvs', v =>
        Result.succeed(
          v.isFilter === true
            ? v.envs.filter(env => {
                let isEnvMember: boolean = env.memberIds.includes(v.userId);

                return isEnvMember || env.envId === PROJECT_ENV_PROD;
              })
            : v.envs
        )
      ),
      Result.bind('sortedEnvs', v =>
        Result.succeed(
          v.visibleEnvs.sort((a, b) =>
            a.envId > b.envId ? 1 : b.envId > a.envId ? -1 : 0
          )
        )
      ),
      Result.map(
        (v): ToBackendGetEnvsListOutput => ({
          envsList: v.sortedEnvs.map(env =>
            this.envsService.wrapToApiEnvsItem({ env: env })
          )
        })
      )
    );
  }
}
