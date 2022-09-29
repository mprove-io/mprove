import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetEvarsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private envsRepository: repositories.EnvsRepository,
    private evarsRepository: repositories.EvarsRepository,
    private membersRepository: repositories.MembersRepository,
    private connectionsRepository: repositories.ConnectionsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEvars)
  async getEvars(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetEvarsRequest)
    reqValid: apiToBackend.ToBackendGetEvarsRequest
  ) {
    let { projectId, envId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let env = await this.envsService.getEnvCheckExists({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let evars = await this.evarsRepository.find({
      project_id: projectId,
      env_id: envId
    });

    let payload: apiToBackend.ToBackendGetEvarsResponsePayload = {
      evars: evars.map(x => wrapper.wrapToApiEvar(x))
    };

    return payload;
  }
}
