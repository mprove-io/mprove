import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetProjectController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetProject)
  async getProject(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetProjectRequest)
    reqValid: apiToBackend.ToBackendGetProjectRequest
  ) {
    let { projectId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsProjectAdmin({
      projectId: projectId,
      memberId: user.user_id
    });

    let payload: apiToBackend.ToBackendGetProjectResponsePayload = {
      project: wrapper.wrapToApiProject(project)
    };

    return payload;
  }
}
