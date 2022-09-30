import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class DeleteEvController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private evsRepository: repositories.EvsRepository,
    private membersService: MembersService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteEv)
  async deleteEv(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendDeleteEvRequest)
    reqValid: apiToBackend.ToBackendDeleteEvRequest
  ) {
    let { projectId, envId, evId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    await this.evsRepository.delete({
      project_id: projectId,
      env_id: envId,
      ev_id: evId
    });

    let payload = {};

    return payload;
  }
}
