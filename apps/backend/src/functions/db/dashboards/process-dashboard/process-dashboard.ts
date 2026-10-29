import { Result } from '@praha/byethrow';
import type { DashboardTab } from '#backend/drizzle/postgres/tables/dashboards';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import type { StructTab } from '#backend/drizzle/postgres/tables/structs';
import { dashboardApiToTab } from '#backend/functions/db/dashboards/dashboard-api-to-tab/dashboard-api-to-tab';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import {
  type PrepStoreMconfigQueryOutput,
  prepStoreMconfigQuery
} from '#backend/functions/db/mconfigs/prep-store-mconfig-query/prep-store-mconfig-query';
import { modelApiToTab } from '#backend/functions/db/models/model-api-to-tab/model-api-to-tab';
import { queryApiToTab } from '#backend/functions/db/queries/query-api-to-tab/query-api-to-tab';
import type { DbService } from '#backend/services/db/db.service';
import { EMPTY_QUERY_ID } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { makeId } from '#common/functions/make-id/make-id';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { ProcessDashboardError } from '#common/types/backend/function-errors/process-dashboard-error';
import type { DashboardX } from '#common/types/backend/parts/dashboard/dashboard-x';
import type { Dashboard } from '#common/types/blockml/parts/dashboard/dashboard';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { Model } from '#common/types/blockml/parts/model/model';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Tile } from '#common/types/blockml/parts/tile/tile';

type PrepareDashboardQueriesPayload = {
  dashboardMconfigIds: string[];
  dashboardMconfigs: Mconfig[];
  dashboardQueryIds: string[];
  dashboardQueries: QueryTab[];
  insertMconfigs: MconfigTab[];
  insertOrUpdateQueries: QueryTab[];
  insertOrDoNothingQueries: QueryTab[];
  dashboardMalloyMconfigs: Mconfig[];
  dashboardMalloyQueries: QueryTab[];
  dashboardStoreMconfigs: Mconfig[];
  storeQueries: QueryTab[];
};

type AssembleDashboardPayload = {
  combinedQueries: QueryTab[];
  newDashboard: DashboardTab;
};

export type ProcessDashboardOutput = {
  newDashboard: DashboardTab;
  insertMconfigs: MconfigTab[];
  insertOrUpdateQueries: QueryTab[];
  insertOrDoNothingQueries: QueryTab[];
};

export async function processDashboard(item: {
  newApiDashboard: Dashboard;
  apiMconfigs: Mconfig[];
  apiQueries: Query[];
  apiModels: Model[];
  fromDashboardX: DashboardX;
  isQueryCache: boolean;
  cachedMconfigs: MconfigTab[];
  cachedQueries: QueryTab[];
  envId: string;
  newDashboardId: string;
  tempStruct: StructTab;
  project: ProjectTab;
  db: DbService;
}): Result.ResultAsync<ProcessDashboardOutput, ProcessDashboardError> {
  return Result.pipe(
    Result.succeed(item),
    Result.bind('prepareDashboardQueriesPayload', v => {
      let dashboardMconfigIds: string[] = v.newApiDashboard.tiles.map(
        x => x.mconfigId
      );

      let dashboardMconfigs: Mconfig[] = v.apiMconfigs.filter(
        x => dashboardMconfigIds.indexOf(x.mconfigId) > -1
      );

      let dashboardQueryIds: string[] = v.newApiDashboard.tiles.map(
        x => x.queryId
      );

      let dashboardQueries: QueryTab[] = v.apiQueries
        .filter(x => dashboardQueryIds.indexOf(x.queryId) > -1)
        .map(x =>
          queryApiToTab({
            apiQuery: x
          })
        );

      let insertMconfigs: MconfigTab[] = [];

      let insertOrUpdateQueries: QueryTab[] = [];

      let insertOrDoNothingQueries: QueryTab[] = [];

      let dashboardMalloyMconfigs: Mconfig[] = dashboardMconfigs.filter(
        mconfig => mconfig.modelType === 'Malloy'
      );

      let dashboardMalloyQueries: QueryTab[] = [];

      dashboardMalloyMconfigs.forEach(apiMconfig => {
        let mconfig: MconfigTab = mconfigApiToTab({
          apiMconfig: apiMconfig
        });

        insertMconfigs.push(mconfig);

        let query: QueryTab = dashboardQueries.find(
          x => x.queryId === mconfig.queryId
        );

        if (
          dashboardMalloyQueries.map(x => x.queryId).indexOf(query.queryId) < 0
        ) {
          dashboardMalloyQueries.push(query);
        }
      });

      let dashboardStoreMconfigs: Mconfig[] = dashboardMconfigs.filter(
        mconfig => mconfig.modelType === 'Store'
      );

      let storeQueries: QueryTab[] = [];

      let prepareDashboardQueriesPayload: PrepareDashboardQueriesPayload = {
        dashboardMconfigIds: dashboardMconfigIds,
        dashboardMconfigs: dashboardMconfigs,
        dashboardQueryIds: dashboardQueryIds,
        dashboardQueries: dashboardQueries,
        insertMconfigs: insertMconfigs,
        insertOrUpdateQueries: insertOrUpdateQueries,
        insertOrDoNothingQueries: insertOrDoNothingQueries,
        dashboardMalloyMconfigs: dashboardMalloyMconfigs,
        dashboardMalloyQueries: dashboardMalloyQueries,
        dashboardStoreMconfigs: dashboardStoreMconfigs,
        storeQueries: storeQueries
      };

      return Result.succeed(prepareDashboardQueriesPayload);
    }),
    Result.andThrough(async v => {
      let storeQueriesResult: Result.Result<
        void[],
        PrepStoreMconfigQueryError
      > = await Result.sequence(
        v.prepareDashboardQueriesPayload.dashboardStoreMconfigs,
        async (
          apiMconfig: Mconfig
        ): Result.ResultAsync<void, PrepStoreMconfigQueryError> => {
          let newMconfig: MconfigTab;

          let newQuery: QueryTab;

          let isError: boolean = false;

          let apiModel: Model = v.apiModels.find(
            y => y.modelId === apiMconfig.modelId
          );

          let prepStoreMconfigQueryOutput: Result.Result<
            PrepStoreMconfigQueryOutput,
            PrepStoreMconfigQueryError
          > = await prepStoreMconfigQuery({
            struct: v.tempStruct,
            project: v.project,
            envId: v.envId,
            mconfigParentType: 'Dashboard',
            mconfigParentId: v.newDashboardId,
            model: modelApiToTab({
              apiModel: apiModel
            }),
            mconfig: mconfigApiToTab({
              apiMconfig: apiMconfig
            }),
            metricsStartDateYYYYMMDD: undefined,
            metricsEndDateYYYYMMDD: undefined,
            db: v.db
          });

          if (Result.isFailure(prepStoreMconfigQueryOutput)) {
            return prepStoreMconfigQueryOutput;
          }

          let mqe: {
            isError: boolean;
            newMconfig: MconfigTab;
            newQuery: QueryTab;
          } = prepStoreMconfigQueryOutput.value;

          newMconfig = mqe.newMconfig;

          newQuery = mqe.newQuery;

          isError = mqe.isError;

          let newDashboardTile: Tile = v.newApiDashboard.tiles.find(
            tile => tile.mconfigId === apiMconfig.mconfigId
          );

          newDashboardTile.queryId = newMconfig.queryId;

          newDashboardTile.mconfigId = newMconfig.mconfigId;

          newDashboardTile.trackChangeId = makeId();

          v.prepareDashboardQueriesPayload.insertMconfigs.push(newMconfig);

          v.prepareDashboardQueriesPayload.storeQueries.push(newQuery);

          return Result.succeed();
        }
      );

      if (Result.isFailure(storeQueriesResult)) {
        return storeQueriesResult;
      }

      return Result.succeed();
    }),
    Result.bind('assembleDashboardPayload', v => {
      let combinedQueries: QueryTab[] = [
        ...v.prepareDashboardQueriesPayload.dashboardMalloyQueries,
        ...v.prepareDashboardQueriesPayload.storeQueries
      ];

      v.prepareDashboardQueriesPayload.insertMconfigs.forEach(mconfig => {
        let query: QueryTab = combinedQueries.find(
          y => y.queryId === mconfig.queryId
        );

        // Previous and new query IDs differ because their parent dashboard IDs differ.
        let prevTile: DashboardX['tiles'][number] = v.fromDashboardX.tiles.find(
          y => y.title === mconfig.chart.title
        );

        let prevQuery = prevTile?.query;

        if (
          v.isQueryCache === true &&
          query.status !== 'Error' &&
          isDefined(prevQuery) &&
          prevQuery.status === 'Completed'
        ) {
          query.data = prevQuery.data;

          query.status = prevQuery.status;

          query.lastCompleteTs = prevQuery.lastCompleteTs;

          query.lastCompleteDuration = prevQuery.lastCompleteDuration;

          v.prepareDashboardQueriesPayload.insertOrUpdateQueries.push(query);
        } else if (
          v.isQueryCache === true &&
          query.status !== 'Error' &&
          prevTile.queryId === EMPTY_QUERY_ID &&
          v.cachedQueries.length > 0
        ) {
          let cachedMconfig: MconfigTab = v.cachedMconfigs.find(
            x => x.chart.title === mconfig.chart.title
          );

          let cachedQuery: QueryTab = v.cachedQueries.find(
            x => x.queryId === cachedMconfig.queryId
          );

          if (cachedQuery.status === 'Completed') {
            query.data = cachedQuery.data;

            query.status = cachedQuery.status;

            query.lastCompleteTs = cachedQuery.lastCompleteTs;

            query.lastCompleteDuration = cachedQuery.lastCompleteDuration;

            v.prepareDashboardQueriesPayload.insertOrUpdateQueries.push(query);
          } else {
            v.prepareDashboardQueriesPayload.insertOrDoNothingQueries.push(
              query
            );
          }
        } else {
          v.prepareDashboardQueriesPayload.insertOrDoNothingQueries.push(query);
        }
      });

      let newDashboard: DashboardTab = dashboardApiToTab({
        apiDashboard: v.newApiDashboard
      });

      let assembleDashboardPayload: AssembleDashboardPayload = {
        combinedQueries: combinedQueries,
        newDashboard: newDashboard
      };

      return Result.succeed(assembleDashboardPayload);
    }),
    Result.map(
      (v): ProcessDashboardOutput => ({
        newDashboard: v.assembleDashboardPayload.newDashboard,
        insertMconfigs: v.prepareDashboardQueriesPayload.insertMconfigs,
        insertOrUpdateQueries:
          v.prepareDashboardQueriesPayload.insertOrUpdateQueries,
        insertOrDoNothingQueries:
          v.prepareDashboardQueriesPayload.insertOrDoNothingQueries
      })
    )
  );
}
