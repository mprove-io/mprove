import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetEnvsListRequestDto,
  ToBackendGetEnvsListResponseDto
} from '#backend/controllers/envs/get-envs-list/get-envs-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { EnvTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { type EnvEnt, envsTable } from '#backend/drizzle/postgres/schema/envs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import type { EnvEntToTabResultError } from '#common/types/backend/function-errors/env-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetEnvsListOutput } from '#common/types/backend/routes/envs/get-envs-list/get-envs-list-output';

@ApiTags('Envs')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetEnvsListController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    @Inject(DRIZZLE) private db: Db
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
        userId: user.userId,
        projectsService: this.projectsService,
        membersService: this.membersService,
        envsService: this.envsService,
        tabService: this.tabService,
        db: this.db
      }),
      Result.andThrough(v =>
        v.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        v.membersService.getMemberCheckExistsResult({
          projectId: v.projectId,
          memberId: v.userId
        })
      ),
      Result.bind('envEnts', async (v): Result.ResultAsync<EnvEnt[], never> => {
        let envEnts: EnvEnt[] = await v.db.drizzle.query.envsTable.findMany({
          where: eq(envsTable.projectId, v.projectId)
        });

        return Result.succeed(envEnts);
      }),
      Result.bind(
        'envs',
        (v): Result.Result<EnvTab[], EnvEntToTabResultError> =>
          Result.sequence(v.envEnts, envEnt =>
            v.tabService.envEntToTabResult({ envEnt: envEnt })
          )
      ),
      Result.map((v): ToBackendGetEnvsListOutput => {
        let envs: EnvTab[] =
          v.isFilter === true
            ? v.envs.filter(env => {
                let isEnvMember: boolean = env.memberIds.includes(v.userId);

                return isEnvMember || env.envId === PROJECT_ENV_PROD;
              })
            : v.envs;

        let sortedEnvs: EnvTab[] = envs.sort((a, b) =>
          a.envId > b.envId ? 1 : b.envId > a.envId ? -1 : 0
        );

        let payload: ToBackendGetEnvsListOutput = {
          envsList: sortedEnvs.map(env =>
            v.envsService.wrapToApiEnvsItem({ env: env })
          )
        };

        return payload;
      })
    );
  }
}
