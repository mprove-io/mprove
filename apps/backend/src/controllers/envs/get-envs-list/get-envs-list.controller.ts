import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { eq } from 'drizzle-orm';
import {
  ToBackendGetEnvsListRequestDto,
  ToBackendGetEnvsListResponseDto
} from '#backend/controllers/envs/get-envs-list/get-envs-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { envsTable } from '#backend/drizzle/postgres/schema/envs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
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
  ) {
    let { projectId, isFilter } = body.input;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let envs = await this.db.drizzle.query.envsTable
      .findMany({
        where: eq(envsTable.projectId, projectId)
      })
      .then(xs => xs.map(x => this.tabService.envEntToTab(x)));

    if (isFilter === true) {
      envs = envs.filter(
        x =>
          x.memberIds.indexOf(user.userId) > -1 || x.envId === PROJECT_ENV_PROD
      );
    }

    let sortedEnvs = envs.sort((a, b) =>
      a.envId > b.envId ? 1 : b.envId > a.envId ? -1 : 0
    );

    let payload: ToBackendGetEnvsListOutput = {
      envsList: sortedEnvs.map(x =>
        this.envsService.wrapToApiEnvsItem({ env: x })
      )
    };

    return payload;
  }
}
