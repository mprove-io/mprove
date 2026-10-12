import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type {
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { getDashboardUrl } from '#backend/functions/get-dashboard-url/get-dashboard-url';
import { DashboardsService } from '#backend/services/db/dashboards/dashboards.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetDashboardPartsError } from '#common/types/backend/function-errors/get-dashboard-parts-error';
import type { PrepareRunDashboardError } from '#common/types/backend/function-errors/prepare-run-dashboard-error';
import type { DashboardPart } from '#common/types/backend/parts/dashboard/dashboard-part';
import type { Member } from '#common/types/backend/parts/member';
import type { RunDashboard } from '#common/types/backend/parts/run/run-dashboard';
import type { RunQuery } from '#common/types/backend/parts/run/run-query';

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

export type PrepareRunDashboardOutput = {
  prepDashboards: RunDashboardPrep[];
  mconfigParts: RunDashboardMconfigPart[];
};

@Injectable()
export class RunDashboardService {
  constructor(
    private membersService: MembersService,
    private dashboardsService: DashboardsService
  ) {}

  async prepareRunDashboardResult(item: {
    structId: string;
    user: UserTab;
    userMember: MemberTab;
    dashboardIds?: string;
    hostUrl: string;
    orgId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    defaultTimezone: string;
  }): Result.ResultAsync<PrepareRunDashboardOutput, PrepareRunDashboardError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.bind(
        'dashboards',
        (v): Result.ResultAsync<DashboardPart[], GetDashboardPartsError> =>
          this.dashboardsService.getDashboardPartsResult({
            structId: v.structId,
            user: v.user,
            apiUserMember: v.apiUserMember
          })
      ),
      Result.bind(
        'dashboardIdsList',
        (v): Result.Result<string[], never> =>
          Result.succeed(v.dashboardIds?.split(','))
      ),
      Result.andThrough(v =>
        isUndefined(v.dashboardIdsList)
          ? Result.succeed()
          : Result.sequence(v.dashboardIdsList, dashboardId =>
              v.dashboards.some(x => x.dashboardId === dashboardId)
                ? Result.succeed()
                : Result.fail({
                    code: 'BACKEND_DASHBOARD_NOT_FOUND',
                    displayData: { id: dashboardId }
                  })
            )
      ),
      Result.map((v): PrepareRunDashboardOutput => {
        let prepDashboards: RunDashboardPrep[] = [];

        let mconfigParts: RunDashboardMconfigPart[] = [];

        v.dashboards
          .filter(
            dashboard =>
              isUndefined(v.dashboardIdsList) ||
              v.dashboardIdsList.includes(dashboard.dashboardId)
          )
          .forEach(dashboard => {
            let prepTiles: RunDashboardPrepTile[] = [];

            dashboard.tiles.forEach(tile => {
              prepTiles.push({ title: tile.title, queryId: tile.queryId });

              mconfigParts.push({
                mconfigId: tile.mconfigId,
                queryId: tile.queryId
              });
            });

            let url: string = getDashboardUrl({
              host: v.hostUrl,
              orgId: v.orgId,
              projectId: v.projectId,
              repoId: v.repoId,
              branch: v.branchId,
              env: v.envId,
              dashboardId: dashboard.dashboardId,
              timezone: v.defaultTimezone
            });

            prepDashboards.push({
              title: dashboard.title,
              dashboardId: dashboard.dashboardId,
              url: url,
              tiles: prepTiles
            });
          });

        return { prepDashboards: prepDashboards, mconfigParts: mconfigParts };
      })
    );
  }

  build(item: {
    prepDashboards: RunDashboardPrep[];
    findQuery: (item: { queryId: string }) => RunQuery;
  }): RunDashboard[] {
    let { prepDashboards, findQuery } = item;

    let dashboards: RunDashboard[] = prepDashboards.map(meta => ({
      title: meta.title,
      dashboardId: meta.dashboardId,
      url: meta.url,
      tiles: meta.tiles.map(tile => ({
        title: tile.title,
        query: findQuery({ queryId: tile.queryId })
      }))
    }));

    return dashboards;
  }

  filterErrors(item: { dashboards: RunDashboard[] }): RunDashboard[] {
    let { dashboards } = item;

    let errorDashboards: RunDashboard[] = dashboards
      .filter(x => x.tiles.filter(y => y.query.status === 'Error').length > 0)
      .map(d => ({
        title: d.title,
        dashboardId: d.dashboardId,
        url: d.url,
        tiles: d.tiles.filter(t => t.query.status === 'Error')
      }));

    return errorDashboards;
  }
}
