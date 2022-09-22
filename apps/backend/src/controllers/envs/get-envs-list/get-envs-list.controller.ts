import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetEnvsListController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsRepository: repositories.EnvsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList)
  async getEnvsList(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetEnvsListRequest)
    reqValid: apiToBackend.ToBackendGetEnvsListRequest
  ) {
    let { projectId } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let envs = await this.envsRepository.find({
      project_id: projectId
    });

    let sortedEnvs = envs.sort((a, b) =>
      a.env_id > b.env_id ? 1 : b.env_id > a.env_id ? -1 : 0
    );

    let payload: apiToBackend.ToBackendGetEnvsListResponsePayload = {
      envsList: sortedEnvs.map(x => wrapper.wrapToApiEnvsItem(x))
    };

    return payload;
  }
}
