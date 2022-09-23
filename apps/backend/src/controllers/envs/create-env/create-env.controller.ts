import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class CreateEnvController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEnv)
  async createEnv(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateEnvRequest)
    reqValid: apiToBackend.ToBackendCreateEnvRequest
  ) {
    let { projectId, envId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.checkMemberIsAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    await this.envsService.checkEnvDoesNotExist({
      projectId: projectId,
      envId: envId
    });

    let newEnv = maker.makeEnv({
      projectId: projectId,
      envId: envId
    });

    await this.dbService.writeRecords({
      modify: false,
      records: {
        envs: [newEnv]
      }
    });

    let payload: apiToBackend.ToBackendCreateEnvResponsePayload = {
      env: wrapper.wrapToApiEnv(newEnv)
    };

    return payload;
  }
}
