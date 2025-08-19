import { Controller, Post, Req, UseGuards } from '@nestjs/common';

import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { ChartsService } from '~backend/services/charts.service';
import { DashboardsService } from '~backend/services/dashboards.service';
import { EnvsService } from '~backend/services/envs.service';
import { MconfigsService } from '~backend/services/mconfigs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { QueriesService } from '~backend/services/queries.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
@Controller()
export class GetQueryController {
  constructor(
    private queriesService: QueriesService,
    private modelsService: ModelsService,
    private chartsService: ChartsService,
    private dashboardsService: DashboardsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private mconfigsService: MconfigsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery)
  async getQuery(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: apiToBackend.ToBackendGetQueryRequest = request.body;

    let {
      queryId,
      mconfigId,
      chartId,
      dashboardId,
      projectId,
      isRepoProd,
      branchId,
      envId
    } = reqValid.payload;

    let repoId = isRepoProd === true ? PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
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
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let mconfig = await this.mconfigsService.getMconfigCheckExists({
      mconfigId: mconfigId,
      structId: bridge.structId
    });

    if (mconfig.queryId !== queryId) {
      throw new ServerError({
        message: ErEnum.BACKEND_MCONFIG_QUERY_ID_MISMATCH
      });
    }

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    let chart;
    if (isDefined(chartId)) {
      chart = await this.chartsService.getChartCheckExists({
        structId: bridge.structId,
        chartId: chartId
      });
    }

    let dashboard;
    if (isDefined(dashboardId)) {
      chart = await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: dashboardId
      });
    }

    let isAccessGranted = isDefined(chart)
      ? checkAccess({
          userAlias: user.alias,
          member: member,
          entity: chart
        })
      : isDefined(dashboard)
        ? checkAccess({
            userAlias: user.alias,
            member: member,
            entity: dashboard
          })
        : checkAccess({
            userAlias: user.alias,
            member: member,
            entity: model
          });

    if (isAccessGranted === false) {
      throw new ServerError({
        message: isDefined(chart)
          ? ErEnum.BACKEND_FORBIDDEN_CHART
          : isDefined(dashboard)
            ? ErEnum.BACKEND_FORBIDDEN_DASHBOARD
            : ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let query = await this.queriesService.getQueryCheckExists({
      queryId: queryId,
      projectId: projectId
    });

    let payload: apiToBackend.ToBackendGetQueryResponsePayload = {
      query: this.wrapToApiService.wrapToApiQuery(query)
    };

    return payload;
  }
}
