import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { checkAccess } from '~backend/functions/check-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
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
import { WrapEnxToApiService } from '~backend/services/wrap-to-api.service';
import { PROD_REPO_ID } from '~common/constants/top';
import { ErEnum } from '~common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import {
  ToBackendGetQueryRequest,
  ToBackendGetQueryResponsePayload
} from '~common/interfaces/to-backend/queries/to-backend-get-query';
import { ServerError } from '~common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
// chart-dialog.component.ts -> startCheckRunning()
// models.component.ts -> checkRunning$
@Throttle({
  '1s': {
    limit: 3 * 2 * 1.5
  },
  '5s': {
    limit: 5 * 2 * 1.5
  },
  '60s': {
    limit: (60 / 3) * 2 * 1.5
  },
  '600s': {
    limit: 10 * (60 / 3) * 2 * 1.5,
    blockDuration: seconds(12 * 60 * 60) // 12h
  }
})
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
    private wrapToApiService: WrapEnxToApiService
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetQuery)
  async getQuery(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetQueryRequest = request.body;

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

    let payload: ToBackendGetQueryResponsePayload = {
      query: this.wrapToApiService.wrapToApiQuery(query)
    };

    return payload;
  }
}
