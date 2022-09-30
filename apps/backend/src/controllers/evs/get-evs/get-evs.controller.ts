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
export class GetEvsController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsService: EnvsService,
    private envsRepository: repositories.EnvsRepository,
    private evsRepository: repositories.EvsRepository,
    private membersRepository: repositories.MembersRepository,
    private connectionsRepository: repositories.ConnectionsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEvs)
  async getEvs(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetEvsRequest)
    reqValid: apiToBackend.ToBackendGetEvsRequest
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

    let evs = await this.evsRepository.find({
      project_id: projectId,
      env_id: envId
    });

    let payload: apiToBackend.ToBackendGetEvsResponsePayload = {
      evs: evs.map(x => wrapper.wrapToApiEv(x))
    };

    return payload;
  }
}
