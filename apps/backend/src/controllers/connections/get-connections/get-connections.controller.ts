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
    let { projectId, perPage, pageNum } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    const [connections, total] = await this.connectionsRepository.findAndCount({
      where: {
        project_id: projectId
      },
      order: {
        connection_id: 'ASC'
      },
      take: perPage,
      skip: (pageNum - 1) * perPage
    });

    let payload: apiToBackend.ToBackendGetConnectionsResponsePayload = {
      connections: connections.map(x => wrapper.wrapToApiConnection(x)),
      total: total
    };

    return payload;
  }
}
