import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetProjectController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private wrapToApiService: WrapToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetProject)
  async getProject(@AttachUser() user: UserEnt, @Req() request: any) {
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
      project: this.wrapToApiService.wrapToApiProject({
        project: project,
        isAdmin: userMember.isAdmin
      }),
      userMember: this.wrapToApiService.wrapToApiMember(userMember)
    };

    return payload;
  }
}
