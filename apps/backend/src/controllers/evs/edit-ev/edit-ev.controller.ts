import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { forEachSeries } from 'p-iteration';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { EvsService } from '~backend/services/evs.service';
import { MembersService } from '~backend/services/members.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class EditEvController {
  constructor(
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private evsService: EvsService,
    private membersService: MembersService,
    private cs: ConfigService<interfaces.Config>,
    private bridgesRepository: repositories.BridgesRepository,
    private dbService: DbService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditEv)
  async editEv(
    @AttachUser() user: schemaPostgres.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendEditEvRequest = request.body;

    let { projectId, envId, evId, val: value } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.user_id,
      projectId: projectId
    });

    let firstProjectId =
      this.cs.get<interfaces.Config['firstProjectId']>('firstProjectId');

    if (
      member.is_admin === common.BoolEnum.FALSE &&
      projectId === firstProjectId
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_RESTRICTED_PROJECT
      });
    }

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
      where: {
        project_id: projectId,
        env_id: envId
      }
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
