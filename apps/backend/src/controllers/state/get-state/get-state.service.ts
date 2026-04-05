import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { checkAccess } from '#backend/functions/check-access';
import { checkModelAccess } from '#backend/functions/check-model-access';
import { BranchesService } from '#backend/services/db/branches.service';
import { BridgesService } from '#backend/services/db/bridges.service';
import { DashboardsService } from '#backend/services/db/dashboards.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { SessionsService } from '#backend/services/db/sessions.service';
import { StructsService } from '#backend/services/db/structs.service';
import { RpcService } from '#backend/services/rpc.service';
import { TabService } from '#backend/services/tab.service';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { getBuilderUrl } from '#common/functions/get-builder-url';
import { getChartUrl } from '#common/functions/get-chart-url';
import { getDashboardUrl } from '#common/functions/get-dashboard-url';
import { getModelUrl } from '#common/functions/get-model-url';
import { getReportUrl } from '#common/functions/get-report-url';
import { mapBmlErrorsToMproveValidationErrors } from '#common/functions/map-bml-errors-to-mprove-validation-errors';
import type { ToBackendGetStateResponsePayload } from '#common/interfaces/to-backend/state/to-backend-get-state';
import type {
  ToDiskGetCatalogNodesRequest,
  ToDiskGetCatalogNodesResponse
} from '#common/interfaces/to-disk/04-catalogs/to-disk-get-catalog-nodes';

@Injectable()
export class GetStateService {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private projectsService: ProjectsService,
    private membersService: MembersService,
    private rpcService: RpcService,
    private sessionsService: SessionsService,
    private structsService: StructsService,
    private branchesService: BranchesService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private dashboardsService: DashboardsService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getState(item: {
    traceId: string;
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    isFetch: boolean;
    getErrors: boolean;
    getRepo: boolean;
    getRepoNodes: boolean;
    getModels: boolean;
    getDashboards: boolean;
    getCharts: boolean;
    getMetrics: boolean;
    getReports: boolean;
  }): Promise<ToBackendGetStateResponsePayload> {
    let {
      traceId,
      user,
      projectId,
      repoId,
      branchId,
      envId,
      isFetch,
      getErrors,
      getRepo,
      getRepoNodes,
      getModels,
      getDashboards,
      getCharts,
      getMetrics,
      getReports
    } = item;

    let userId = user.userId;

    let repoType = await this.sessionsService.checkRepoId({
      repoId: repoId,
      userId: userId,
      projectId: projectId,
      allowProdRepo: true
    });

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: userId
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

    // get repo (disk RPC) - skip if not needed
    let diskResponse: ToDiskGetCatalogNodesResponse;

    if (getRepo === true) {
      let baseProject = this.tabService.projectTabToBaseProject({
        project: project
      });

      let toDiskGetCatalogNodesRequest: ToDiskGetCatalogNodesRequest = {
        info: {
          name: ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes,
          traceId: traceId
        },
        payload: {
          orgId: project.orgId,
          baseProject: baseProject,
          repoId: repoId,
          branch: branchId,
          isFetch: isFetch
        }
      };

      diskResponse =
        await this.rpcService.sendToDisk<ToDiskGetCatalogNodesResponse>({
          orgId: project.orgId,
          projectId: projectId,
          repoId: repoId,
          message: toDiskGetCatalogNodesRequest,
          checkIsOk: true
        });
    }

    // get struct
    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId,
      isGetEmptyStructOnError: true
    });

    // get all models for struct
    let allModels = await this.db.drizzle.query.modelsTable
      .findMany({
        where: eq(modelsTable.structId, bridge.structId)
      })
      .then(xs => xs.map(x => this.tabService.modelEntToTab(x)));

    let modelsWithAccess = allModels.filter(model =>
      checkModelAccess({
        member: userMember,
        modelAccessRoles: model.accessRoles
      })
    );

    // get charts
    let charts = await this.db.drizzle.query.chartsTable
      .findMany({
        where: eq(chartsTable.structId, bridge.structId)
      })
      .then(xs => xs.map(x => this.tabService.chartEntToTab(x)));

    let chartsGrantedAccess = charts.filter(x => {
      let model = allModels.find(y => y.modelId === x.modelId);

      return checkModelAccess({
        member: userMember,
        modelAccessRoles: model.accessRoles
      });
    });

    // get dashboards
    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let dashboardParts = await this.dashboardsService.getDashboardParts({
      structId: bridge.structId,
      user: user,
      apiUserMember: apiUserMember
    });

    // get reports
    let draftReports = await this.db.drizzle.query.reportsTable
      .findMany({
        where: and(
          eq(reportsTable.draft, true),
          eq(reportsTable.creatorId, userId),
          eq(reportsTable.structId, bridge.structId)
        )
      })
      .then(xs => xs.map(x => this.tabService.reportEntToTab(x)));

    let structReports = await this.db.drizzle.query.reportsTable
      .findMany({
        where: and(
          eq(reportsTable.draft, false),
          eq(reportsTable.structId, bridge.structId)
        )
      })
      .then(xs => xs.map(x => this.tabService.reportEntToTab(x)));

    let reportsGrantedAccess = structReports.filter(x =>
      checkAccess({
        member: userMember,
        accessRoles: x.accessRoles
      })
    );

    let reports = [
      ...draftReports
        .sort((a, b) =>
          a.draftCreatedTs > b.draftCreatedTs
            ? 1
            : b.draftCreatedTs > a.draftCreatedTs
              ? -1
              : 0
        )
        .reverse(),

      ...reportsGrantedAccess.sort((a, b) => {
        let aTitle = a.title.toLowerCase() || a.reportId.toLowerCase();
        let bTitle = b.title.toLowerCase() || a.reportId.toLowerCase();

        return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
      })
    ];

    let hostUrl = this.cs
      .get<BackendConfig['hostUrl']>('hostUrl')
      .split(',')[0];

    let orgId = project.orgId;
    let defaultTimezone = struct.mproveConfig.defaultTimezone;

    let builderUrl = getBuilderUrl({
      host: hostUrl,
      orgId: orgId,
      projectId: projectId,
      repoId: repoId,
      branch: branchId,
      env: envId
    });

    let repo: ToBackendGetStateResponsePayload['repo'];

    if (getRepo === true && diskResponse) {
      let diskRepo = diskResponse.payload.repo;

      delete diskRepo.changesToCommit;
      delete diskRepo.changesToPush;

      if (getRepoNodes === false) {
        delete diskRepo.nodes;
      }

      repo = diskRepo;
    }

    let payload: ToBackendGetStateResponsePayload = {
      needValidate: bridge.needValidate,
      structId: struct.structId,
      validationErrorsTotal: struct.errors.length,
      modelsTotal: modelsWithAccess.length,
      chartsTotal: chartsGrantedAccess.length,
      dashboardsTotal: dashboardParts.length,
      reportsTotal: reports.length,
      builderUrl: builderUrl,
      validationErrors:
        getErrors === true
          ? mapBmlErrorsToMproveValidationErrors({
              errors: struct.errors
            })
          : [],
      modelItems:
        getModels === true
          ? modelsWithAccess.map(m => ({
              modelId: m.modelId,
              url: getModelUrl({
                host: hostUrl,
                orgId: orgId,
                projectId: projectId,
                repoId: repoId,
                branch: branchId,
                env: envId,
                modelId: m.modelId,
                timezone: defaultTimezone
              })
            }))
          : [],
      chartItems:
        getCharts === true
          ? chartsGrantedAccess.map(c => ({
              chartId: c.chartId,
              url: getChartUrl({
                host: hostUrl,
                orgId: orgId,
                projectId: projectId,
                repoId: repoId,
                branch: branchId,
                env: envId,
                modelId: c.modelId,
                chartId: c.chartId,
                timezone: defaultTimezone
              })
            }))
          : [],
      dashboardItems:
        getDashboards === true
          ? dashboardParts.map(d => ({
              dashboardId: d.dashboardId,
              url: getDashboardUrl({
                host: hostUrl,
                orgId: orgId,
                projectId: projectId,
                repoId: repoId,
                branch: branchId,
                env: envId,
                dashboardId: d.dashboardId,
                timezone: defaultTimezone
              })
            }))
          : [],
      reportItems:
        getReports === true
          ? reports.map(r => ({
              reportId: r.reportId,
              url: getReportUrl({
                host: hostUrl,
                orgId: orgId,
                projectId: projectId,
                repoId: repoId,
                branch: branchId,
                env: envId,
                reportId: r.reportId,
                timezone: defaultTimezone,
                timeSpec: 'days',
                timeRange: 'f`last 5 days`'
              })
            }))
          : [],
      metricItems:
        getMetrics === true
          ? struct.metrics.map(x => ({
              metricId: x.metricId,
              name: `${x.partNodeLabel} ${x.partFieldLabel} by ${x.timeNodeLabel} ${x.timeFieldLabel} - ${x.topLabel}`
            }))
          : [],
      repo: repo
    };

    return payload;
  }
}
