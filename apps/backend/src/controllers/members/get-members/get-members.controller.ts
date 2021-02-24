import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetMembersController {
  constructor(
    private membersRepository: repositories.MembersRepository,
    private projectsService: ProjectsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMembers)
  async getMembers(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetMembersRequest)
    reqValid: apiToBackend.ToBackendGetMembersRequest
  ) {
    let { projectId } = reqValid.payload;

    await this.projectsService.checkUserIsProjectMember({
      userId: user.user_id,
      projectId: projectId
    });

    let members = await this.membersRepository.find({ project_id: projectId });

    let payload: apiToBackend.ToBackendGetMembersResponsePayload = {
      members: members.map(x => wrapper.wrapToApiMember(x))
    };

    return payload;
  }
}
