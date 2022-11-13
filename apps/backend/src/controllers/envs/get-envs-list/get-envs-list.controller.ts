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
export class GetEnvsListController {
  constructor(
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private envsRepository: repositories.EnvsRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetEnvsList)
  async getEnvsList(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetEnvsListRequest = request.body;

    let { projectId, isFilter } = reqValid.payload;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let envs: entities.EnvEntity[] = [];

    if (isFilter === true) {
      envs = await this.envsRepository.find({
        where: {
          project_id: projectId,
          env_id: In([...member.envs, common.PROJECT_ENV_PROD])
        }
      });
    } else {
      envs = await this.envsRepository.find({
        where: { project_id: projectId }
      });
    }

    let sortedEnvs = envs.sort((a, b) =>
      a.env_id > b.env_id ? 1 : b.env_id > a.env_id ? -1 : 0
    );

    let payload: apiToBackend.ToBackendGetEnvsListResponsePayload = {
      envsList: sortedEnvs.map(x => wrapper.wrapToApiEnvsItem(x))
    };

    return payload;
  }
}
