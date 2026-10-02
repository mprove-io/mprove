import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ToBackendGetProjectRequestDto,
  ToBackendGetProjectResponseDto
} from '#backend/controllers/projects/get-project/get-project.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGetProjectOutput } from '#common/types/backend/routes/projects/get-project/get-project-output';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProjectController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService
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
  ) {
    let { projectId } = body.input;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let payload: ToBackendGetProjectOutput = {
      project: this.projectsService.tabToApiProject({
        project: project,
        isAddPublicKey: userMember.isAdmin === true,
        isAddGitUrl: userMember.isAdmin === true
      }),
      userMember: this.membersService.tabToApi({ member: userMember })
    };

    return payload;
  }
}
