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
import { StructsService } from '~backend/services/structs.service';

@Controller()
export class GetDashboardReportController {
  constructor(
    private branchesService: BranchesService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private structsService: StructsService,
    private dashboardsService: DashboardsService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboardReport)
  async getDashboardReport(
    @AttachUser() user: entities.UserEntity,
    @ValidateRequest(apiToBackend.ToBackendGetDashboardReportRequest)
    reqValid: apiToBackend.ToBackendGetDashboardReportRequest
  ) {
    let {
      projectId,
      isRepoProd,
      branchId,
      envId,
      dashboardId,
      mconfigId
    } = reqValid.payload;

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

    let dashboard = await this.dashboardsService.getDashboardCheckExists({
      structId: bridge.struct_id,
      dashboardId: dashboardId
    });

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: userMember,
      vmd: dashboard
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
      });
    }

    if (
      dashboard.reports.map(report => report.mconfigId).indexOf(mconfigId) < 0
    ) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_REPORT_MCONFIG_ID_MISMATCH
      });
    }

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      structId: bridge.struct_id,
      mconfigId: mconfigId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.struct_id,
      modelId: mconfig.model_id
    });

    let query = await this.queriesService.getQueryCheckExists({
      queryId: mconfig.query_id
    });

    let apiMember = wrapper.wrapToApiMember(userMember);

    let payload: apiToBackend.ToBackendGetDashboardReportResponsePayload = {
      userMember: apiMember,
      query: wrapper.wrapToApiQuery(query),
      mconfig: wrapper.wrapToApiMconfig({
        mconfig: mconfig,
        modelFields: model.fields
      })
    };

    return payload;
  }
}
