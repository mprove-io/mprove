import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/db/members.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import {
  ToBackendGetProjectRequest,
  ToBackendGetProjectResponsePayload
} from '~common/interfaces/to-backend/projects/to-backend-get-project';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Controller()
export class GetProjectController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetProject)
  async getProject(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetProjectRequest = request.body;

    let { projectId } = reqValid.payload;

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
