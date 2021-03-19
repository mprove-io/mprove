import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class DeleteConnectionController {
  constructor(
    private projectsService: ProjectsService,
    private connectionsRepository: repositories.ConnectionsRepository,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteConnection)
  async deleteConnection(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteConnectionRequest)
    reqValid: apiToBackend.ToBackendDeleteConnectionRequest
  ) {
    let { projectId, connectionId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    await this.connectionsRepository.delete({
      project_id: projectId,
      connection_id: connectionId
    });

    let payload = {};

    return payload;
  }
}
