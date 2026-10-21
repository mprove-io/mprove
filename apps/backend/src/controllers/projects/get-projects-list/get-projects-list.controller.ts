import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import {
  ToBackendGetProjectsListRequestDto,
  ToBackendGetProjectsListResponseDto
} from '#backend/controllers/projects/get-projects-list/get-projects-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProjectsListOutput } from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProjectsListController {
  constructor(
    private projectsService: ProjectsService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetProjectsList' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetProjectsList',
    description: `Get organization's projects accessible to the user`
  })
  @ApiOkResponse({
    type: ToBackendGetProjectsListResponseDto
  })
  async getProjectsList(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetProjectsListRequestDto
  ): Promise<BackendResultForOperation<'getProjectsList'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        userId: user.userId
      }),
      Result.bind('userMembers', v =>
        this.db.members.findMany({
          where: eq(membersTable.memberId, v.userId)
        })
      ),
      Result.bind('projectIds', v =>
        Result.succeed(v.userMembers.map(userMember => userMember.projectId))
      ),
      Result.bind('projects', async v =>
        v.projectIds.length === 0
          ? Result.succeed<ProjectTab[]>([])
          : this.db.projects.findMany({
              where: and(
                inArray(projectsTable.projectId, v.projectIds),
                eq(projectsTable.orgId, v.orgId)
              )
            })
      ),
      Result.map(
        (v): ToBackendGetProjectsListOutput => ({
          projectsList: v.projects
            .sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0))
            .map(project =>
              this.projectsService.wrapToApiProjectsItem({ project: project })
            )
        })
      )
    );
  }
}
