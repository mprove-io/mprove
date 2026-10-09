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
import { Result } from '@praha/byethrow';
import { and, eq, inArray } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetProjectsListRequestDto,
  ToBackendGetProjectsListResponseDto
} from '#backend/controllers/projects/get-projects-list/get-projects-list.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ProjectTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import type { MemberEnt } from '#backend/drizzle/postgres/schema/members';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import type { ProjectEnt } from '#backend/drizzle/postgres/schema/projects';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ProjectEntToTabResultError } from '#common/types/backend/function-errors/project-ent-to-tab-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProjectsListOutput } from '#common/types/backend/routes/projects/get-projects-list/get-projects-list-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProjectsListController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
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
      Result.bind(
        'projects',
        async (
          v
        ): Result.ResultAsync<ProjectTab[], ProjectEntToTabResultError> => {
          let userMemberEnts: MemberEnt[] =
            await this.db.drizzle.query.membersTable.findMany({
              where: eq(membersTable.memberId, v.userId)
            });

          let projectIds: string[] = userMemberEnts.map(
            userMemberEnt => userMemberEnt.projectId
          );

          return projectIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.projectsTable
                .findMany({
                  where: and(
                    inArray(projectsTable.projectId, projectIds),
                    eq(projectsTable.orgId, v.orgId)
                  )
                })
                .then((projectEnts: ProjectEnt[]) =>
                  Result.sequence(projectEnts, projectEnt =>
                    this.tabService.projectEntToTabResult({
                      projectEnt: projectEnt
                    })
                  )
                );
        }
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
