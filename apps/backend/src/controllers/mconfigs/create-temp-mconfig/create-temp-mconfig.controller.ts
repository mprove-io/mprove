import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DbService } from '~backend/services/db.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateTempMconfigController {
  constructor(
    private dbService: DbService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfig)
  async createTempMconfig(
    @AttachUser() user: entities.UserEntity,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateTempMconfigRequest = request.body;

    let { oldMconfigId, mconfig, projectId, isRepoProd, branchId, envId } =
      reqValid.payload;

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

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    let oldMconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.struct_id,
      mconfigId: oldMconfigId
    });

    if (
      oldMconfig.query_id !== mconfig.queryId ||
      oldMconfig.model_id !== mconfig.modelId ||
      oldMconfig.struct_id !== mconfig.structId
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_OLD_MCONFIG_MISMATCH
      });
    }

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.struct_id,
      modelId: mconfig.modelId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      vmd: model
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
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
