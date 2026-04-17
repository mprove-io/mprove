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
import { and, eq, inArray } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGetProjectsListRequestDto,
  ToBackendGetProjectsListResponseDto
} from '#backend/controllers/projects/get-projects-list/get-projects-list.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ProjectsItem } from '#common/zod/backend/projects-item';
import type { ToBackendGetProjectsListResponsePayload } from '#common/zod/to-backend/projects/to-backend-get-projects-list';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetProjectsList)
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
  ) {
    let { orgId } = body.payload;

    let userMembers = await this.db.drizzle.query.membersTable.findMany({
      where: eq(membersTable.memberId, user.userId)
    });

    let projectIds = userMembers.map(m => m.projectId);

    let projects =
      projectIds.length === 0
        ? []
        : await this.db.drizzle.query.projectsTable
            .findMany({
              where: and(
                inArray(projectsTable.projectId, projectIds),
                eq(projectsTable.orgId, orgId)
              )
            })
            .then(xs => xs.map(x => this.tabService.projectEntToTab(x)));

    let sortedProjects = projects.sort((a, b) =>
      a.name > b.name ? 1 : b.name > a.name ? -1 : 0
    );

    let projectsItems: ProjectsItem[] = sortedProjects.map(x =>
      this.projectsService.wrapToApiProjectsItem({ project: x })
    );

    let payload: ToBackendGetProjectsListResponsePayload = {
      projectsList: projectsItems
    };

    return payload;
  }
}
