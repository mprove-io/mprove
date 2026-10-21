import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import {
  ToBackendGetProjectRequestDto,
  ToBackendGetProjectResponseDto
} from '#backend/controllers/projects/get-project/get-project.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { membersTable } from '#backend/drizzle/postgres/schema/members';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProjectOutput } from '#common/types/backend/routes/projects/get-project/get-project-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProjectController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private db: DbService
  ) {}

  @Post('api/ToBackendGetProject' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GetProject',
    description: 'Get a project'
  })
  @ApiOkResponse({
    type: ToBackendGetProjectResponseDto
  })
  async getProject(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGetProjectRequestDto
  ): Promise<BackendResultForOperation<'getProject'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        userId: user.userId
      }),
      Result.bind('project', v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.userId),
            eq(membersTable.projectId, v.projectId)
          )
        })
      ),
      Result.map(
        (v): ToBackendGetProjectOutput => ({
          project: this.projectsService.tabToApiProject({
            project: v.project,
            isAddPublicKey: v.userMember.isAdmin === true,
            isAddGitUrl: v.userMember.isAdmin === true
          }),
          userMember: this.membersService.tabToApi({ member: v.userMember })
        })
      )
    );
  }
}
