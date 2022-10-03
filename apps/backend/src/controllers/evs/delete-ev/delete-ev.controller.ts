import { Controller, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class DeleteEvController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private dbService: DbService,
    private evsRepository: repositories.EvsRepository,
    private cs: ConfigService<interfaces.Config>,
    private bridgesRepository: repositories.BridgesRepository,
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

    let firstProjectId = this.cs.get<interfaces.Config['firstProjectId']>(
      'firstProjectId'
    );

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

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

    let branchBridges = await this.bridgesRepository.find({
      project_id: projectId,
      env_id: envId
    });

    await forEachSeries(branchBridges, async x => {
      x.need_validate = common.BoolEnum.TRUE;
    });

    await this.dbService.writeRecords({
      modify: true,
      records: {
        bridges: [...branchBridges]
      }
    });

    let payload = {};

    return payload;
  }
}
