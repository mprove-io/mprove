import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { DbService } from '~backend/services/db.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class CreateTempMconfigController {
  constructor(
    private dbService: DbService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfig)
  async createTempMconfig(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendCreateTempMconfigRequest)
    reqValid: apiToBackend.ToBackendCreateTempMconfigRequest
  ) {
    let {
      oldMconfigId,
      mconfig,
      projectId,
      isRepoProd,
      branchId
    } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.user_id;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let oldMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: branch.struct_id,
      mconfigId: oldMconfigId
    });

    if (
      oldMconfig.query_id !== mconfig.queryId ||
      oldMconfig.model_id !== mconfig.modelId ||
      oldMconfig.struct_id !== mconfig.structId
    ) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_OLD_MCONFIG_MISMATCH
      });
    }

    let model = await this.modelsService.getModelCheckExists({
      structId: branch.struct_id,
      modelId: mconfig.modelId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: model,
      checkExplorer: true
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: apiToBackend.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    mconfig.temp = true;

    await this.dbService.writeRecords({
      modify: false,
      records: {
        mconfigs: [wrapper.wrapToEntityMconfig(mconfig)]
      }
    });

    let payload = {};

    return payload;
  }
}
