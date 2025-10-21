import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle, seconds } from '@nestjs/throttler';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { UserTab } from '~backend/drizzle/postgres/schema/_tabs';
import { checkModelAccess } from '~backend/functions/check-model-access';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/db/branches.service';
import { BridgesService } from '~backend/services/db/bridges.service';
import { ChartsService } from '~backend/services/db/charts.service';
import { DashboardsService } from '~backend/services/db/dashboards.service';
import { EnvsService } from '~backend/services/db/envs.service';
import { MconfigsService } from '~backend/services/db/mconfigs.service';
import { MembersService } from '~backend/services/db/members.service';
import { ModelsService } from '~backend/services/db/models.service';
import { ProjectsService } from '~backend/services/db/projects.service';
import { QueriesService } from '~backend/services/db/queries.service';
import { TabService } from '~backend/services/tab.service';
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
    private tabService: TabService,
    private queriesService: QueriesService,
    private modelsService: ModelsService,
    private chartsService: ChartsService,
    private dashboardsService: DashboardsService,
    private membersService: MembersService,
    private branchesService: BranchesService,
    private projectsService: ProjectsService,
    private mconfigsService: MconfigsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService
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

    let userMember = await this.membersService.getMemberCheckExists({
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
      member: userMember
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

    if (isDefined(chartId)) {
      await this.chartsService.getChartCheckExistsAndAccess({
        structId: bridge.structId,
        chartId: chartId,
        userMember: userMember,
        user: user
      });
    } else if (isDefined(dashboardId)) {
      await this.dashboardsService.getDashboardCheckExistsAndAccess({
        structId: bridge.structId,
        dashboardId: dashboardId,
        userMember: userMember,
        user: user
      });
    } else {
      let model = await this.modelsService.getModelCheckExists({
        structId: bridge.structId,
        modelId: mconfig.modelId
      });

      let isAccessGranted = checkModelAccess({
        member: userMember,
        modelAccessRoles: model.accessRoles
      });

      if (isAccessGranted === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_FORBIDDEN_MODEL
        });
      }
    }

    let query = await this.queriesService.getQueryCheckExists({
      queryId: queryId,
      projectId: projectId
    });

    let payload: ToBackendGetQueryResponsePayload = {
      query: this.queriesService.tabToApi({ query: query })
    };

    return payload;
  }
}
