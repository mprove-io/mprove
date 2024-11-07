import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetConnectionsController {
  constructor(
    private connectionsRepository: repositories.ConnectionsRepository,
    private projectsService: ProjectsService,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetConnections)
  async getConnections(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetConnectionsRequest = request.body;

    let { projectId, perPage, pageNum } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
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

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetConnectionsResponsePayload = {
      userMember: apiMember,
      connections: connections.map(x => wrapper.wrapToApiConnection(x)),
      total: total
    };

    return payload;
  }
}
