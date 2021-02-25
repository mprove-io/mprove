import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetConnectionsController {
  constructor(
    private connectionsRepository: repositories.ConnectionsRepository,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetConnections)
  async getConnections(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetConnectionsRequest)
    reqValid: apiToBackend.ToBackendGetConnectionsRequest
  ) {
    let { projectId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsEditorOrAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    let connections = await this.connectionsRepository.find({
      project_id: projectId
    });

    let payload: apiToBackend.ToBackendGetConnectionsResponsePayload = {
      connections: connections.map(x => wrapper.wrapToApiConnection(x))
    };

    return payload;
  }
}
