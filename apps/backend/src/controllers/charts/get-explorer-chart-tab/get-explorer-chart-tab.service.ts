import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { bridgesTable } from '#backend/drizzle/postgres/tables/bridges';
import type { ChartTab } from '#backend/drizzle/postgres/tables/charts';
import { chartsTable } from '#backend/drizzle/postgres/tables/charts';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import { membersTable } from '#backend/drizzle/postgres/tables/members';
import type { ModelTab } from '#backend/drizzle/postgres/tables/models';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import { sessionsTable } from '#backend/drizzle/postgres/tables/sessions';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { chartTabToApi } from '#backend/functions/db/charts/chart-tab-to-api/chart-tab-to-api';
import { mconfigTabToApi } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/mconfig-tab-to-api';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { DbService } from '#backend/services/db/db.service';
import {
  ExplorerChartRebuildService,
  type ExplorerRebuildResult
} from '#backend/services/explorer/explorer-chart-rebuild/explorer-chart-rebuild.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { DbMconfigsFindFirstError } from '#common/types/backend/function-errors/db/mconfigs/db-mconfigs-find-first-error';
import type { DbModelsFindManyError } from '#common/types/backend/function-errors/db/models/db-models-find-many-error';
import type { DbQueriesFindFirstError } from '#common/types/backend/function-errors/db/queries/db-queries-find-first-error';
import type { GetExplorerChartTabError } from '#common/types/backend/function-errors/get-explorer-chart-tab-error';
import type { RebuildFromYamlError } from '#common/types/backend/function-errors/rebuild-from-yaml-error';
import type { RunQueriesError } from '#common/types/backend/function-errors/run-queries-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
import type { ChartX } from '#common/types/backend/parts/chart/chart-x';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ToBackendGetExplorerChartTabOutput } from '#common/types/backend/routes/charts/get-explorer-chart-tab/get-explorer-chart-tab-output';
import type { ToBackendRunQueriesOutput } from '#common/types/backend/routes/queries/run-queries/run-queries-output';
import type { BmlError } from '#common/types/blockml/diagnostics/bml-error';
import type { Query } from '#common/types/blockml/parts/query/query';
import type { Tile } from '#common/types/blockml/parts/tile/tile';
import type { Er } from '#common/types/shared/errors/er';

type ResolveChartPayload = {
  chartYaml: string;
  modelId: string;
  chart: ChartTab;
  mconfig: MconfigTab;
  query: QueryTab;
  rebuildErrors: BmlError[];
};

type AssembleChartResponsePayload = {
  isRebuildError: boolean;
  apiPayload: ToBackendGetExplorerChartTabOutput;
};

type GetExplorerChartTabErrors = Extract<
  ToBackendGetExplorerChartTabOutput,
  {
    status: 'error';
  }
>['errors'];

@Injectable()
export class GetExplorerChartTabService {
  constructor(
    private explorerChartRebuildService: ExplorerChartRebuildService,
    private runQueriesService: RunQueriesService,
    private db: DbService
  ) {}

  async getExplorerChartTab(item: {
    user: UserTab;
    traceId: string;
    sessionId: string;
    chartId: string;
  }): Result.ResultAsync<
    ToBackendGetExplorerChartTabOutput,
    GetExplorerChartTabError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('session', v =>
        this.db.sessions.findFirstCheckExists({
          where: eq(sessionsTable.sessionId, v.sessionId)
        })
      ),
      Result.andThrough(v =>
        v.session.userId !== v.user.userId
          ? Result.fail({
              code: 'BACKEND_UNAUTHORIZED'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.session.type !== 'Explorer'
          ? Result.fail({
              code: 'BACKEND_SESSION_TYPE_IS_NOT_EXPLORER'
            })
          : Result.succeed()
      ),
      Result.bind('userMember', v =>
        this.db.members.findFirstCheckExists({
          where: and(
            eq(membersTable.memberId, v.user.userId),
            eq(membersTable.projectId, v.session.projectId)
          )
        })
      ),
      Result.bind('bridge', v =>
        this.db.bridges.findFirst({
          where: and(
            eq(bridgesTable.projectId, v.session.projectId),
            eq(bridgesTable.repoId, v.session.repoId),
            eq(bridgesTable.branchId, v.session.branchId),
            eq(bridgesTable.envId, v.session.envId)
          )
        })
      ),
      Result.andThrough(v =>
        isUndefined(v.bridge)
          ? Result.fail({
              code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST'
            })
          : Result.succeed()
      ),
      Result.bind('originalChart', v =>
        this.db.charts.findFirst({
          where: and(
            eq(chartsTable.sessionId, v.sessionId),
            eq(chartsTable.chartId, v.chartId)
          )
        })
      ),
      Result.andThrough(v =>
        isUndefined(v.originalChart)
          ? Result.fail({
              code: 'BACKEND_CHART_DOES_NOT_EXIST'
            })
          : Result.succeed()
      ),
      Result.bind('resolveChartPayload', v => {
        let chartYaml: string = v.originalChart.chartYaml;

        let modelId: string = v.originalChart.modelId;

        let chart: ChartTab;

        let mconfig: MconfigTab;

        let query: QueryTab;

        let rebuildErrors: BmlError[];

        let resolveChartPayload: ResolveChartPayload = {
          chartYaml: chartYaml,
          modelId: modelId,
          chart: chart,
          mconfig: mconfig,
          query: query,
          rebuildErrors: rebuildErrors
        };

        return Result.succeed(resolveChartPayload);
      }),
      Result.bind('chartAtCurrent', v =>
        this.db.charts.findFirst({
          where: and(
            eq(chartsTable.sessionId, v.sessionId),
            eq(chartsTable.chartId, v.chartId),
            eq(chartsTable.structId, v.bridge.structId)
          )
        })
      ),
      Result.andThrough(async v => {
        if (v.chartAtCurrent) {
          let chartTile: Tile = v.chartAtCurrent.tiles[0];

          let existingMconfigResult: Result.Result<
            MconfigTab,
            DbMconfigsFindFirstError
          > = await this.db.mconfigs.findFirst({
            where: and(
              eq(mconfigsTable.mconfigId, chartTile.mconfigId),
              eq(mconfigsTable.structId, v.bridge.structId)
            )
          });

          if (Result.isFailure(existingMconfigResult)) {
            return existingMconfigResult;
          }

          let existingMconfig: MconfigTab = existingMconfigResult.value;

          let queryResult: Result.Result<QueryTab, DbQueriesFindFirstError> =
            await this.db.queries.findFirst({
              where: eq(queriesTable.queryId, chartTile.queryId)
            });

          if (Result.isFailure(queryResult)) {
            return queryResult;
          }

          let existingQuery: QueryTab = queryResult.value;

          if (existingMconfig && existingQuery) {
            v.resolveChartPayload.chart = v.chartAtCurrent;

            v.resolveChartPayload.mconfig = existingMconfig;

            v.resolveChartPayload.query = existingQuery;
          }
        }

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (
          !v.resolveChartPayload.chart ||
          !v.resolveChartPayload.mconfig ||
          !v.resolveChartPayload.query
        ) {
          let explorerRebuildResult: Result.Result<
            ExplorerRebuildResult,
            RebuildFromYamlError
          > = await this.explorerChartRebuildService.rebuildFromYaml({
            traceId: v.traceId,
            session: v.session,
            chartId: v.chartId,
            modelId: v.resolveChartPayload.modelId,
            chartYaml: v.resolveChartPayload.chartYaml
          });

          if (Result.isFailure(explorerRebuildResult)) {
            if (
              explorerRebuildResult.error.code !==
              'BACKEND_MODEL_DOES_NOT_EXIST'
            ) {
              return explorerRebuildResult;
            }

            v.resolveChartPayload.rebuildErrors = [
              {
                title: 'Model does not exist',
                message: 'BACKEND_MODEL_DOES_NOT_EXIST' satisfies Er,
                lines: []
              }
            ];

            return Result.succeed();
          }

          let rebuildResult: ExplorerRebuildResult =
            explorerRebuildResult.value;

          if (rebuildResult?.ok === false) {
            v.resolveChartPayload.rebuildErrors = rebuildResult.errors;
          } else if (rebuildResult?.ok === true) {
            let rebuiltChart: ChartTab = rebuildResult.chart;

            let rebuiltMconfig: MconfigTab = rebuildResult.mconfig;

            let rebuiltQuery: QueryTab = rebuildResult.query;

            rebuiltChart.title = v.originalChart.title;

            let persistenceResult: Result.Result<void, WriteError> =
              await this.db.write({
                insert: {
                  charts: [rebuiltChart],
                  mconfigs: [rebuiltMconfig]
                },
                insertOrDoNothing: {
                  queries: [rebuiltQuery]
                }
              });

            if (Result.isFailure(persistenceResult)) {
              return persistenceResult;
            }

            let toBackendRunQueriesOutput: Result.Result<
              ToBackendRunQueriesOutput,
              RunQueriesError
            > = await this.runQueriesService.runQueries({
              user: v.user,
              projectId: v.session.projectId,
              repoId: v.session.repoId,
              branchId: v.session.branchId,
              envId: v.session.envId,
              mconfigIds: [rebuiltMconfig.mconfigId]
            });

            if (Result.isFailure(toBackendRunQueriesOutput)) {
              return toBackendRunQueriesOutput;
            }

            let queryResult: Result.Result<QueryTab, DbQueriesFindFirstError> =
              await this.db.queries.findFirst({
                where: eq(queriesTable.queryId, rebuiltQuery.queryId)
              });

            v.resolveChartPayload.chart = rebuiltChart;

            v.resolveChartPayload.mconfig = rebuiltMconfig;

            if (Result.isFailure(queryResult)) {
              return queryResult;
            }

            v.resolveChartPayload.query = queryResult.value ?? rebuiltQuery;
          }
        }

        return Result.succeed();
      }),
      Result.bind('assembleChartResponsePayload', v => {
        let isRebuildError: boolean = !isUndefined(
          v.resolveChartPayload.rebuildErrors
        );

        let apiPayload: ToBackendGetExplorerChartTabOutput;

        let assembleChartResponsePayload: AssembleChartResponsePayload = {
          isRebuildError: isRebuildError,
          apiPayload: apiPayload
        };

        return Result.succeed(assembleChartResponsePayload);
      }),
      Result.andThrough(async v => {
        if (v.assembleChartResponsePayload.isRebuildError) {
          v.assembleChartResponsePayload.apiPayload = {
            status: 'error',
            errors: v.resolveChartPayload
              .rebuildErrors as GetExplorerChartTabErrors
          };
        } else {
          if (
            !v.resolveChartPayload.chart ||
            !v.resolveChartPayload.mconfig ||
            !v.resolveChartPayload.query
          ) {
            return Result.fail({
              code: 'BACKEND_CHART_DOES_NOT_EXIST'
            });
          }

          let modelResult: Result.Result<ModelTab[], DbModelsFindManyError> =
            await this.db.models.findMany({
              where: eq(modelsTable.structId, v.bridge.structId)
            });

          if (Result.isFailure(modelResult)) {
            return modelResult;
          }

          let allModels: ModelTab[] = modelResult.value;

          let model: ModelTab = allModels.find(
            x => x.modelId === v.resolveChartPayload.mconfig.modelId
          );

          let apiUserMember: Member = memberTabToApi({
            member: v.userMember
          });

          let apiModels: ModelX[] = allModels.map(m =>
            modelTabToApi({
              model: m,
              hasAccess: checkModelAccess({
                member: v.userMember,
                modelAccessRoles: m.accessRolesCombined
              })
            })
          );

          let apiQuery: Query = queryTabToApi({
            query: v.resolveChartPayload.query
          });

          let mconfigX: MconfigX = mconfigTabToApi({
            mconfig: v.resolveChartPayload.mconfig,
            modelFields: model ? model.fields : []
          });

          let chartX: ChartX = chartTabToApi({
            chart: v.resolveChartPayload.chart,
            mconfigs: [mconfigX],
            queries: [apiQuery],
            member: apiUserMember,
            models: apiModels,
            isAddMconfigAndQuery: true
          });

          v.assembleChartResponsePayload.apiPayload = {
            status: 'ok',
            chart: chartX,
            mconfig: mconfigX,
            query: apiQuery
          };
        }

        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendGetExplorerChartTabOutput =>
          v.assembleChartResponsePayload.apiPayload
      )
    );
  }
}
