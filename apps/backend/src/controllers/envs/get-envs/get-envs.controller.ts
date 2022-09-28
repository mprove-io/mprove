import { Controller, Post } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetEnvsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsRepository: repositories.EnvsRepository,
    private connectionsRepository: repositories.ConnectionsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvs)
  async getEnvs(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetEnvsRequest)
    reqValid: apiToBackend.ToBackendGetEnvsRequest
  ) {
    let { projectId, perPage, pageNum } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    const [envs, total] = await this.envsRepository.findAndCount({
      where: {
        project_id: projectId
      },
      order: {
        env_id: 'ASC'
      },
      take: perPage,
      skip: (pageNum - 1) * perPage
    });

    let connections = await this.connectionsRepository.find({
      where: {
        project_id: projectId,
        env_id: In(envs.map(x => x.env_id))
      }
    });

    let payload: apiToBackend.ToBackendGetEnvsResponsePayload = {
      envs: envs.map(x =>
        wrapper.wrapToApiEnv({
          env: x,
          envConnectionIds: connections
            .filter(y => y.env_id === x.env_id)
            .map(connection => connection.connection_id)
        })
      ),
      total: total
    };

    return payload;
  }
}
