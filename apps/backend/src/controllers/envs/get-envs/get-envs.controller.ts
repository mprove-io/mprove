import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { In } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetEnvsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsRepository: repositories.EnvsRepository,
    private membersRepository: repositories.MembersRepository,
    private connectionsRepository: repositories.ConnectionsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvs)
  async getEnvs(@AttachUser() user: entities.UserEntity, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetEnvsRequest = request.body;

    let { projectId, perPage, pageNum } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
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

    let members = await this.membersRepository.find({
      where: {
        project_id: projectId
      }
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetEnvsResponsePayload = {
      userMember: apiMember,
      envs: envs.map(x =>
        wrapper.wrapToApiEnv({
          env: x,
          envConnectionIds: connections
            .filter(y => y.env_id === x.env_id)
            .map(connection => connection.connection_id),
          envMembers:
            x.env_id === common.PROJECT_ENV_PROD
              ? members
              : members.filter(m => m.envs.indexOf(x.env_id) > -1)
        })
      ),
      total: total
    };

    return payload;
  }
}
