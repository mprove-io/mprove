import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class DeleteEnvController {
  constructor(
    private projectsService: ProjectsService,
    private envsRepository: repositories.EnvsRepository,
    private membersService: MembersService,
    private bridgesRepository: repositories.BridgesRepository
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteEnv)
  async deleteEnv(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendDeleteEnvRequest = request.body;

    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    if (envId === common.PROJECT_ENV_PROD) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_ENV_PROD_CAN_NOT_BE_DELETED
      });
    }

    await this.envsRepository.delete({
      project_id: projectId,
      env_id: envId
    });

    await this.bridgesRepository.delete({
      project_id: projectId,
      env_id: envId
    });

    let payload = {};

    return payload;
  }
}
