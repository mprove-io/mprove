import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { QueriesService } from '~backend/services/queries.service';
import { StructsService } from '~backend/services/structs.service';
import { VizsService } from '~backend/services/vizs.service';

@Controller()
export class GetVizController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private vizsService: VizsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetViz)
  async getViz(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetVizRequest)
    reqValid: apiToBackend.ToBackendGetVizRequest
  ) {
    let { projectId, isRepoProd, branchId, envId, vizId } = reqValid.payload;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.user_id
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: isRepoProd === true ? common.PROD_REPO_ID : user.user_id,
      branchId: branchId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.project_id,
      repoId: branch.repo_id,
      branchId: branch.branch_id,
      envId: envId
    });

    await this.structsService.getStructCheckExists({
      structId: bridge.struct_id,
      projectId: projectId
    });

    let viz = await this.vizsService.getVizCheckExists({
      structId: bridge.struct_id,
      vizId: vizId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: userMember,
      vmd: viz
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_VIS
      });
    }

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.struct_id,
      mconfigId: viz.reports[0].mconfigId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.struct_id,
      modelId: mconfig.model_id
    });

    let query = await this.queriesService.getQueryCheckExists({
      queryId: mconfig.query_id
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetVizResponsePayload = {
      userMember: apiMember,
      viz: wrapper.wrapToApiViz({
        viz: viz,
        mconfigs: [
          wrapper.wrapToApiMconfig({
            mconfig: mconfig,
            modelFields: model.fields
          })
        ],
        queries: [wrapper.wrapToApiQuery(query)],
        member: wrapper.wrapToApiMember(userMember),
        models: [
          wrapper.wrapToApiModel({
            model: model,
            hasAccess: helper.checkAccess({
              userAlias: user.alias,
              member: userMember,
              vmd: model
            })
          })
        ],
        isAddMconfigAndQuery: true
      })
    };

    return payload;
  }
}
