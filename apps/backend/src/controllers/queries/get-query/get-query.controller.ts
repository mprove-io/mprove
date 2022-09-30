import { Controller, Post } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { wrapper } from '~backend/barrels/wrapper';
import { AttachUser, ValidateRequest } from '~backend/decorators/_index';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { QueriesService } from '~backend/services/queries.service';
import { VizsService } from '~backend/services/vizs.service';

@Controller()
export class GetQueryController {
  constructor(
    private queriesService: QueriesService,
    private modelsService: ModelsService,
    private vizsService: VizsService,
    private dashboardsService: DashboardsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private mconfigsService: MconfigsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery)
  async getQuery(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetQueryRequest)
    reqValid: apiToBackend.ToBackendGetQueryRequest
  ) {
    let {
      queryId,
      mconfigId,
      vizId,
      dashboardId,
      projectId,
      isRepoProd,
      branchId,
      envId
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
      mconfigId: mconfigId,
      structId: bridge.struct_id
    });

    if (mconfig.query_id !== queryId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MCONFIG_QUERY_ID_MISMATCH
      });
    }

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.struct_id,
      modelId: mconfig.model_id
    });

    let viz;
    if (common.isDefined(vizId)) {
      viz = await this.vizsService.getVizCheckExists({
        structId: bridge.struct_id,
        vizId: vizId
      });
    }

    let dashboard;
    if (common.isDefined(dashboardId)) {
      viz = await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.struct_id,
        dashboardId: dashboardId
      });
    }

    let isAccessGranted = common.isDefined(viz)
      ? helper.checkAccess({
          userAlias: user.alias,
          member: member,
          vmd: viz
        })
      : common.isDefined(dashboard)
      ? helper.checkAccess({
          userAlias: user.alias,
          member: member,
          vmd: dashboard
        })
      : helper.checkAccess({
          userAlias: user.alias,
          member: member,
          vmd: model
        });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.isDefined(viz)
          ? common.ErEnum.BACKEND_FORBIDDEN_VIZ
          : common.isDefined(dashboard)
          ? common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
          : common.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let query = await this.queriesService.getQueryCheckExists({
      queryId: queryId
    });

    let payload: apiToBackend.ToBackendGetQueryResponsePayload = {
      query: wrapper.wrapToApiQuery(query)
    };

    return payload;
  }
}
