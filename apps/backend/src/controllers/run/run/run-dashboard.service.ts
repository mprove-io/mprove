import { Injectable } from '@nestjs/common';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { DashboardsService } from '#backend/services/db/dashboards.service';
import { MembersService } from '#backend/services/db/members.service';
import { ErEnum } from '#common/enums/er.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { getDashboardUrl } from '#common/functions/get-dashboard-url';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { RunDashboard } from '#common/zod/backend/run/run-dashboard';
import type { RunQuery } from '#common/zod/backend/run/run-query';

interface RunDashboardPrepTile {
  title: string;
  queryId: string;
}

interface RunDashboardPrep {
  title: string;
  dashboardId: string;
  url: string;
  tiles: RunDashboardPrepTile[];
}

interface RunDashboardMconfigPart {
  mconfigId: string;
  queryId: string;
}

@Injectable()
export class RunDashboardService {
  constructor(
    private membersService: MembersService,
    private dashboardsService: DashboardsService
  ) {}

  async prepare(item: {
    structId: string;
    user: UserTab;
    userMember: MemberTab;
    dashboardIds: string | undefined;
    hostUrl: string;
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    defaultTimezone: string;
  }) {
    let {
      structId,
      user,
      userMember,
      dashboardIds,
      hostUrl,
      orgId,
      projectId,
      repoId,
      branchId,
      envId,
      defaultTimezone
    } = item;

    let prepDashboards: RunDashboardPrep[] = [];

    let mconfigParts: RunDashboardMconfigPart[] = [];

    let apiUserMember = this.membersService.tabToApi({
      member: userMember
    });

    let dashboards = await this.dashboardsService.getDashboardParts({
      structId: structId,
      user: user,
      apiUserMember: apiUserMember
    });

    let dashboardIdsList = dashboardIds?.split(',');

    if (isDefined(dashboardIdsList)) {
      dashboardIdsList.forEach(dashboardId => {
        let isFound =
          dashboards
            .map(dashboard => dashboard.dashboardId)
            .indexOf(dashboardId) > -1;

        if (isFound === false) {
          let serverError = new ServerError({
            message: ErEnum.BACKEND_DASHBOARD_NOT_FOUND,
            displayData: { id: dashboardId },
            originalError: null
          });
          throw serverError;
        }
      });
    }

    dashboards
      .filter(
        dashboard =>
          isUndefined(dashboardIdsList) ||
          dashboardIdsList.indexOf(dashboard.dashboardId) > -1
      )
      .forEach(dashboard => {
        let prepTiles: RunDashboardPrepTile[] = [];

        dashboard.tiles.forEach(tile => {
          prepTiles.push({
            title: tile.title,
            queryId: tile.queryId
          });

          mconfigParts.push({
            mconfigId: tile.mconfigId,
            queryId: tile.queryId
          });
        });

        let url = getDashboardUrl({
          host: hostUrl,
          orgId: orgId,
          projectId: projectId,
          repoId: repoId,
          branch: branchId,
          env: envId,
          dashboardId: dashboard.dashboardId,
          timezone: defaultTimezone
        });

        prepDashboards.push({
          title: dashboard.title,
          dashboardId: dashboard.dashboardId,
          url: url,
          tiles: prepTiles
        });
      });

    return { prepDashboards: prepDashboards, mconfigParts: mconfigParts };
  }

  build(item: {
    prepDashboards: RunDashboardPrep[];
    findQuery: (item: { queryId: string }) => RunQuery;
  }): RunDashboard[] {
    let { prepDashboards, findQuery } = item;

    return prepDashboards.map(meta => ({
      title: meta.title,
      dashboardId: meta.dashboardId,
      url: meta.url,
      tiles: meta.tiles.map(tile => ({
        title: tile.title,
        query: findQuery({ queryId: tile.queryId })
      }))
    }));
  }

  filterErrors(item: { dashboards: RunDashboard[] }): RunDashboard[] {
    let { dashboards } = item;

    return dashboards
      .filter(
        x =>
          x.tiles.filter(y => y.query.status === QueryStatusEnum.Error).length >
          0
      )
      .map(d => ({
        title: d.title,
        dashboardId: d.dashboardId,
        url: d.url,
        tiles: d.tiles.filter(t => t.query.status === QueryStatusEnum.Error)
      }));
  }
}
