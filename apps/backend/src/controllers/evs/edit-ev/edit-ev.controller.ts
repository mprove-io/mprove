import { Controller, Post } from '@nestjs/common';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { EvsService } from '~backend/services/evs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class EditEvController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private evsService: EvsService,
    private membersService: MembersService,
    private bridgesRepository: repositories.BridgesRepository,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditEv)
  async editEv(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendEditEvRequest)
    reqValid: apiToBackend.ToBackendEditEvRequest
  ) {
    let { projectId, envId, evId, val: value } = reqValid.payload;

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

    let ev = await this.evsService.getEvCheckExists({
      projectId: projectId,
      envId: envId,
      evId: evId
    });

    ev.val = value;

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
      modify: true,
      records: {
        evs: [ev]
      }
    });

    let payload: apiToBackend.ToBackendEditEvResponsePayload = {
      ev: wrapper.wrapToApiEv(ev)
    };

    return payload;
  }
}
