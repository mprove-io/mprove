import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { RunQueriesService } from '#backend/controllers/queries/run-queries/run-queries.service';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  ChartTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  QueryTab,
  SessionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { chartsTable } from '#backend/drizzle/postgres/schema/charts';
import type { MconfigEnt } from '#backend/drizzle/postgres/schema/mconfigs';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import type { QueryEnt } from '#backend/drizzle/postgres/schema/queries';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { checkModelAccess } from '#backend/functions/check-model-access/check-model-access';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { SessionsService } from '#backend/services/db/sessions/sessions.service';
import {
  ExplorerChartRebuildService,
  type ExplorerRebuildResult
} from '#backend/services/explorer/explorer-chart-rebuild/explorer-chart-rebuild.service';
import { TabService } from '#backend/services/tab/tab.service';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BridgeEntToTabError } from '#common/types/backend/function-errors/bridge-ent-to-tab-error';
import type { ChartEntToTabError } from '#common/types/backend/function-errors/chart-ent-to-tab-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { GetExplorerChartTabError } from '#common/types/backend/function-errors/get-explorer-chart-tab-error';
import type { GetMemberCheckExistsError } from '#common/types/backend/function-errors/get-member-check-exists-error';
import type { GetSessionByIdCheckExistsError } from '#common/types/backend/function-errors/get-session-by-id-check-exists-error';
import type { MconfigEntToTabError } from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';
import type { ModelEntToTabError } from '#common/types/backend/function-errors/model-ent-to-tab-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { RebuildFromYamlError } from '#common/types/backend/function-errors/rebuild-from-yaml-error';
import type { RunQueriesError } from '#common/types/backend/function-errors/run-queries-error';
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
    private sessionsService: SessionsService,
    private membersService: MembersService,
    private modelsService: ModelsService,
    private chartsService: ChartsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private tabService: TabService,
    private explorerChartRebuildService: ExplorerChartRebuildService,
    private runQueriesService: RunQueriesService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getExplorerChartTabResult(item: {
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
      Result.bind(
        'session',
        (v): Result.ResultAsync<SessionTab, GetSessionByIdCheckExistsError> =>
          this.sessionsService.getSessionByIdCheckExists({
            sessionId: v.sessionId
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
      Result.bind(
        'userMember',
        (v): Result.ResultAsync<MemberTab, GetMemberCheckExistsError> =>
          this.membersService.getMemberCheckExists({
            projectId: v.session.projectId,
            memberId: v.user.userId
          })
      ),
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, BridgeEntToTabError> =>
          this.db.drizzle.query.bridgesTable
            .findFirst({
              where: and(
                eq(bridgesTable.projectId, v.session.projectId),
                eq(bridgesTable.repoId, v.session.repoId),
                eq(bridgesTable.branchId, v.session.branchId),
                eq(bridgesTable.envId, v.session.envId)
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.bridgeEntToTab({
                    bridgeEnt: x
                  })
            )
      ),
      Result.andThrough(v =>
        isUndefined(v.bridge)
          ? Result.fail({
              code: 'BACKEND_BRIDGE_BRANCH_ENV_DOES_NOT_EXIST'
            })
          : Result.succeed()
      ),
      Result.bind(
        'originalChart',
        (v): Result.ResultAsync<ChartTab, ChartEntToTabError> =>
          this.db.drizzle.query.chartsTable
            .findFirst({
              where: and(
                eq(chartsTable.sessionId, v.sessionId),
                eq(chartsTable.chartId, v.chartId)
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.chartEntToTab({
                    chartEnt: x
                  })
            )
      ),
      Result.andThrough(v =>
        isUndefined(v.originalChart)
          ? Result.fail({
              code: 'BACKEND_CHART_DOES_NOT_EXIST'
            })
          : Result.succeed()
      ),
      Result.bind(
        'resolveChartPayload',
        (v): Result.Result<ResolveChartPayload, never> => {
          let chartYaml: string = v.originalChart.chartYaml;

          let modelId: string = v.originalChart.modelId;

          let chart: ChartTab;

          let mconfig: MconfigTab;

          let query: QueryTab;

          let rebuildErrors: BmlError[];

          return Result.succeed({
            chartYaml: chartYaml,
            modelId: modelId,
            chart: chart,
            mconfig: mconfig,
            query: query,
            rebuildErrors: rebuildErrors
          });
        }
      ),
      Result.bind(
        'chartAtCurrent',
        (v): Result.ResultAsync<ChartTab, ChartEntToTabError> =>
          this.db.drizzle.query.chartsTable
            .findFirst({
              where: and(
                eq(chartsTable.sessionId, v.sessionId),
                eq(chartsTable.chartId, v.chartId),
                eq(chartsTable.structId, v.bridge.structId)
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.chartEntToTab({
                    chartEnt: x
                  })
            )
      ),
      Result.andThrough(async v => {
        if (v.chartAtCurrent) {
          let chartTile: Tile = v.chartAtCurrent.tiles[0];

          let mconfigEnt: MconfigEnt =
            await this.db.drizzle.query.mconfigsTable.findFirst({
              where: and(
                eq(mconfigsTable.mconfigId, chartTile.mconfigId),
                eq(mconfigsTable.structId, v.bridge.structId)
              )
            });

          let existingMconfigResult: Result.Result<
            MconfigTab,
            MconfigEntToTabError
          > = isUndefined(mconfigEnt)
            ? Result.succeed(undefined)
            : this.tabService.mconfigEntToTab({
                mconfigEnt: mconfigEnt
              });

          if (Result.isFailure(existingMconfigResult)) {
            return existingMconfigResult;
          }

          let existingMconfig: MconfigTab = existingMconfigResult.value;

          let queryEnt: QueryEnt =
            await this.db.drizzle.query.queriesTable.findFirst({
              where: eq(queriesTable.queryId, chartTile.queryId)
            });

          let queryResult: Result.Result<QueryTab, QueryEntToTabError> =
            isUndefined(queryEnt)
              ? Result.succeed(undefined)
              : this.tabService.queryEntToTab({
                  queryEnt: queryEnt
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

            let persistenceResult: Result.Result<void, DbErrorToError> =
              await dbErrorToResult({
                action: async () => {
                  await retry(
                    async () =>
                      await this.db.drizzle.transaction(
                        async tx =>
                          await this.db.packer.write({
                            tx: tx,
                            insert: {
                              charts: [rebuiltChart],
                              mconfigs: [rebuiltMconfig]
                            },
                            insertOrDoNothing: {
                              queries: [rebuiltQuery]
                            }
                          })
                      ),
                    getRetryOption(this.cs, this.logger)
                  );
                }
              });

            if (Result.isFailure(persistenceResult)) {
              return persistenceResult;
            }

            let toBackendRunQueriesOutput: Result.Result<
              ToBackendRunQueriesOutput,
              RunQueriesError
            > = await this.runQueriesService.runQueriesResult({
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

            let queryEnt: QueryEnt =
              await this.db.drizzle.query.queriesTable.findFirst({
                where: eq(queriesTable.queryId, rebuiltQuery.queryId)
              });

            v.resolveChartPayload.chart = rebuiltChart;

            v.resolveChartPayload.mconfig = rebuiltMconfig;

            let queryResult: Result.Result<QueryTab, QueryEntToTabError> =
              isUndefined(queryEnt)
                ? Result.succeed(undefined)
                : this.tabService.queryEntToTab({
                    queryEnt: queryEnt
                  });

            if (Result.isFailure(queryResult)) {
              return queryResult;
            }

            v.resolveChartPayload.query = queryResult.value ?? rebuiltQuery;
          }
        }

        return Result.succeed();
      }),
      Result.bind(
        'assembleChartResponsePayload',
        (v): Result.Result<AssembleChartResponsePayload, never> => {
          let isRebuildError: boolean = !isUndefined(
            v.resolveChartPayload.rebuildErrors
          );

          let apiPayload: ToBackendGetExplorerChartTabOutput;

          return Result.succeed({
            isRebuildError: isRebuildError,
            apiPayload: apiPayload
          });
        }
      ),
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

          let modelsResult: Result.Result<ModelTab[], ModelEntToTabError> =
            await this.db.drizzle.query.modelsTable
              .findMany({
                where: eq(modelsTable.structId, v.bridge.structId)
              })
              .then(xs =>
                Result.sequence(xs, x =>
                  isUndefined(x)
                    ? Result.succeed(undefined)
                    : this.tabService.modelEntToTab({
                        modelEnt: x
                      })
                )
              );

          if (Result.isFailure(modelsResult)) {
            return modelsResult;
          }

          let allModels: ModelTab[] = modelsResult.value;

          let model: ModelTab = allModels.find(
            x => x.modelId === v.resolveChartPayload.mconfig.modelId
          );

          let apiUserMember: Member = this.membersService.tabToApi({
            member: v.userMember
          });

          let apiModels: ModelX[] = allModels.map(m =>
            this.modelsService.tabToApi({
              model: m,
              hasAccess: checkModelAccess({
                member: v.userMember,
                modelAccessRoles: m.accessRolesCombined
              })
            })
          );

          let apiQuery: Query = this.queriesService.tabToApi({
            query: v.resolveChartPayload.query
          });

          let mconfigX: MconfigX = this.mconfigsService.tabToApi({
            mconfig: v.resolveChartPayload.mconfig,
            modelFields: model ? model.fields : []
          });

          let chartX: ChartX = this.chartsService.tabToApi({
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
