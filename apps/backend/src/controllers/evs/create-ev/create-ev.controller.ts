import { Controller, Post } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class CreateEvController {
  constructor(
    private projectsService: ProjectsService,
    private bridgesRepository: repositories.BridgesRepository,
    private envsService: EnvsService,
    private membersService: MembersService,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateEv)
  async createEv(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateEvRequest)
    reqValid: apiToBackend.ToBackendCreateEvRequest
  ) {
    let { projectId, envId, evId, val } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let newEv = maker.makeEv({
      projectId: projectId,
      envId: envId,
      evId: evId,
      val: val
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

    await this.dbService.writeRecords({
      modify: false,
      records: {
        evs: [newEv]
      }
    });

    let payload: apiToBackend.ToBackendCreateEvResponsePayload = {
      ev: wrapper.wrapToApiEv(newEv)
    };

    return payload;
  }
}
