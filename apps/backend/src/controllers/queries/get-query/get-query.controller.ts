import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
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
import { WrapToApiService } from '~backend/services/wrap-to-api.service';

@UseGuards(ValidateRequestGuard)
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
    private envsService: EnvsService,
    private wrapToApiService: WrapToApiService
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery)
  async getQuery(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendGetQueryRequest = request.body;

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

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

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
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MCONFIG_QUERY_ID_MISMATCH
      });
    }

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    let viz;
    if (common.isDefined(vizId)) {
      viz = await this.vizsService.getVizCheckExists({
        structId: bridge.structId,
        vizId: vizId
      });
    }

    let dashboard;
    if (common.isDefined(dashboardId)) {
      viz = await this.dashboardsService.getDashboardCheckExists({
        structId: bridge.structId,
        dashboardId: dashboardId
      });
    }

    let isAccessGranted = common.isDefined(viz)
      ? helper.checkAccess({
          userAlias: user.alias,
          member: member,
          entity: viz
        })
      : common.isDefined(dashboard)
      ? helper.checkAccess({
          userAlias: user.alias,
          member: member,
          entity: dashboard
        })
      : helper.checkAccess({
          userAlias: user.alias,
          member: member,
          entity: model
        });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.isDefined(viz)
          ? common.ErEnum.BACKEND_FORBIDDEN_VIS
          : common.isDefined(dashboard)
          ? common.ErEnum.BACKEND_FORBIDDEN_DASHBOARD
          : common.ErEnum.BACKEND_FORBIDDEN_MODEL
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
