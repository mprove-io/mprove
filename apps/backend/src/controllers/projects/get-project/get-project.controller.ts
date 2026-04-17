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
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import type { ToBackendGetProjectResponsePayload } from '#common/zod/to-backend/projects/to-backend-get-project';

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Controller()
export class GetProjectController {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetProject)
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
    let { projectId } = body.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let payload: ToBackendGetProjectResponsePayload = {
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
