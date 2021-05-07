import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { AvatarsRepository } from '~backend/models/store-repositories/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetProjectController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private avatarsRepository: AvatarsRepository
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

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let avatar = await this.avatarsRepository.findOne({
      where: {
        user_id: user.user_id
      }
    });

    if (common.isDefined(avatar)) {
      apiMember.avatarSmall = avatar.avatar_small;
    }

    let payload: apiToBackend.ToBackendGetProjectResponsePayload = {
      project: wrapper.wrapToApiProject(project),
      userMember: apiMember
    };

    return payload;
  }
}
