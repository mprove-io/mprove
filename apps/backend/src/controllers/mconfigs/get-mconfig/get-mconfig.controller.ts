import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';

@Controller()
export class GetMconfigController {
  constructor(
    private mconfigsService: MconfigsService,
    private modelsService: ModelsService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig)
  async getMconfig(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetMconfigRequest)
    reqValid: apiToBackend.ToBackendGetMconfigRequest
  ) {
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      mconfigId
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

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.struct_id,
      mconfigId: mconfigId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.struct_id,
      modelId: mconfig.model_id
    });

    let payload: apiToBackend.ToBackendGetMconfigResponsePayload = {
      mconfig: wrapper.wrapToApiMconfig({
        mconfig: mconfig,
        modelFields: model.fields
      })
    };

    return payload;
  }
}
