import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ChartTab,
  MconfigTab,
  MemberTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  StructTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import type { ChartOrModelAccess } from '#backend/services/db/charts/charts.service';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import type { PrepStoreMconfigQueryOutput } from '#backend/services/db/mconfigs/mconfigs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import type { EditMalloyQueryOutput } from '#backend/services/malloy/malloy.service';
import { MalloyService } from '#backend/services/malloy/malloy.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { CheckChartOrModelAccessError } from '#common/types/backend/function-errors/check-chart-or-model-access-error';
import type { DbErrorToError } from '#common/types/backend/function-errors/db-error-to-error';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { GetChartCheckExistsError } from '#common/types/backend/function-errors/get-chart-check-exists-error';
import type { GetChartDataError } from '#common/types/backend/function-errors/get-chart-data-error';
import type { GetMconfigCheckExistsError } from '#common/types/backend/function-errors/get-mconfig-check-exists-error';
import type { GetModelCheckExistsError } from '#common/types/backend/function-errors/get-model-check-exists-error';
import type { GetStructCheckExistsError } from '#common/types/backend/function-errors/get-struct-check-exists-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { QueryEntToTabError } from '#common/types/backend/function-errors/query-ent-to-tab-error';
import type { Member } from '#common/types/backend/parts/member';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { ToBackendGetChartOutput } from '#common/types/backend/routes/charts/get-chart/get-chart-output';

type PrepareQueryPayload = {
  newMconfig: MconfigTab;
  newQuery: QueryTab;
  isError: boolean;
};

@Injectable()
export class QueryInfoChartService {
  constructor(
    private tabService: TabService,
    private malloyService: MalloyService,
    private chartsService: ChartsService,
    private mconfigsService: MconfigsService,
    private modelsService: ModelsService,
    private queriesService: QueriesService,
    private membersService: MembersService,
    private structsService: StructsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getChartData(item: {
    traceId: string;
    user: UserTab;
    userMember: MemberTab;
    project: ProjectTab;
    projectId: string;
    envId: string;
    structId: string;
    chartId: string;
    timezone: string;
    skipUi: boolean;
  }): Promise<ToBackendGetChartOutput> {
    let {
      traceId,
      user,
      userMember,
      project,
      projectId,
      envId,
      structId,
      chartId,
      timezone,
      skipUi
    } = item;

    let result: Result.Result<ToBackendGetChartOutput, GetChartDataError> =
      await this.getChartDataResult({
        traceId: traceId,
        user: user,
        userMember: userMember,
        project: project,
        projectId: projectId,
        envId: envId,
        structId: structId,
        chartId: chartId,
        timezone: timezone,
        skipUi: skipUi
      });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          'displayData' in result.error ? result.error.displayData : undefined,
        customData: 'info' in result.error ? result.error.info : undefined
      });
    }

    let output: ToBackendGetChartOutput = result.value;

    return output;
  }

  async getChartDataResult(item: {
    traceId: string;
    user: UserTab;
    userMember: MemberTab;
    project: ProjectTab;
    projectId: string;
    envId: string;
    structId: string;
    chartId: string;
    timezone: string;
    skipUi: boolean;
  }): Result.ResultAsync<ToBackendGetChartOutput, GetChartDataError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        v.userMember.isExplorer === false
          ? Result.fail({
              code: 'BACKEND_MEMBER_IS_NOT_EXPLORER'
            })
          : Result.succeed()
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.structId,
            projectId: v.projectId
          })
      ),
      Result.bind(
        'chart',
        (v): Result.ResultAsync<ChartTab, GetChartCheckExistsError> =>
          this.chartsService.getChartCheckExistsResult({
            structId: v.structId,
            chartId: v.chartId,
            userMember: v.userMember,
            user: v.user
          })
      ),
      Result.bind(
        'chartMconfig',
        (v): Result.ResultAsync<MconfigTab, GetMconfigCheckExistsError> =>
          this.mconfigsService.getMconfigCheckExistsResult({
            structId: v.structId,
            mconfigId: v.chart.tiles[0].mconfigId
          })
      ),
      Result.bind(
        'model',
        (v): Result.ResultAsync<ModelTab, GetModelCheckExistsError> =>
          this.modelsService.getModelCheckExistsResult({
            structId: v.structId,
            modelId: v.chartMconfig.modelId
          })
      ),
      Result.bind(
        'chartOrModelAccess',
        (v): Result.Result<ChartOrModelAccess, CheckChartOrModelAccessError> =>
          this.chartsService.checkChartOrModelAccessResult({
            chart: v.chart,
            model: v.model,
            userMember: v.userMember
          })
      ),
      Result.bind(
        'prepareQueryPayload',
        (v): Result.Result<PrepareQueryPayload, never> => {
          let newMconfig: MconfigTab;

          let newQuery: QueryTab;

          let isError: boolean = false;

          return Result.succeed({
            newMconfig: newMconfig,
            newQuery: newQuery,
            isError: isError
          });
        }
      ),
      Result.andThrough(async v => {
        if (v.model.type === 'Store') {
          v.chartMconfig.timezone = v.timezone;

          let prepStoreMconfigQueryOutput: Result.Result<
            PrepStoreMconfigQueryOutput,
            PrepStoreMconfigQueryError
          > = await this.mconfigsService.prepStoreMconfigQueryResult({
            struct: v.struct,
            project: v.project,
            envId: v.envId,
            mconfigParentType: v.chartMconfig.parentType,
            mconfigParentId: v.chartMconfig.parentId,
            model: v.model,
            mconfig: v.chartMconfig,
            metricsStartDateYYYYMMDD: undefined,
            metricsEndDateYYYYMMDD: undefined
          });

          if (Result.isFailure(prepStoreMconfigQueryOutput)) {
            return prepStoreMconfigQueryOutput;
          }

          let mqe: {
            isError: boolean;
            newMconfig: MconfigTab;
            newQuery: QueryTab;
          } = prepStoreMconfigQueryOutput.value;

          v.prepareQueryPayload.newMconfig = mqe.newMconfig;

          v.prepareQueryPayload.newQuery = mqe.newQuery;

          v.prepareQueryPayload.isError = mqe.isError;
        } else if (v.model.type === 'Malloy') {
          let queryOperation: QueryOperation = {
            type: 'Get',
            timezone: v.timezone
          };

          let editMalloyQueryOutput: Result.Result<
            EditMalloyQueryOutput,
            EditMalloyQueryError
          > = await this.malloyService.editMalloyQueryResult({
            projectId: v.projectId,
            envId: v.envId,
            structId: v.struct.structId,
            mconfigParentType: v.chartMconfig.parentType,
            mconfigParentId: v.chartMconfig.parentId,
            user: v.user,
            model: v.model,
            mconfig: v.chartMconfig,
            queryOperations: [queryOperation]
          });

          if (Result.isFailure(editMalloyQueryOutput)) {
            return editMalloyQueryOutput;
          }

          let editMalloyQueryResult: {
            isError: boolean;
            newMconfig: MconfigTab;
            newQuery: QueryTab;
          } = editMalloyQueryOutput.value;

          v.prepareQueryPayload.newMconfig = editMalloyQueryResult.newMconfig;
          v.prepareQueryPayload.newQuery = editMalloyQueryResult.newQuery;
          v.prepareQueryPayload.isError = editMalloyQueryResult.isError;
        }

        return Result.succeed();
      }),
      Result.andThrough(async v => {
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
                          mconfigs: [v.prepareQueryPayload.newMconfig]
                        },
                        insertOrUpdate: {
                          queries:
                            v.prepareQueryPayload.isError === true
                              ? [v.prepareQueryPayload.newQuery]
                              : []
                        },
                        insertOrDoNothing: {
                          queries:
                            v.prepareQueryPayload.isError === false
                              ? [v.prepareQueryPayload.newQuery]
                              : []
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

        return Result.succeed();
      }),
      Result.bind(
        'query',
        (v): Result.ResultAsync<QueryTab, QueryEntToTabError> =>
          this.db.drizzle.query.queriesTable
            .findFirst({
              where: and(
                eq(
                  queriesTable.queryId,
                  v.prepareQueryPayload.newQuery.queryId
                ),
                eq(
                  queriesTable.projectId,
                  v.prepareQueryPayload.newQuery.projectId
                )
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.queryEntToTabResult({
                    queryEnt: x
                  })
            )
      ),
      Result.andThrough(v => {
        v.chart.tiles[0].mconfigId = v.prepareQueryPayload.newMconfig.mconfigId;
        v.chart.tiles[0].queryId = v.prepareQueryPayload.newMconfig.queryId;

        return Result.succeed({});
      }),
      Result.andThrough(async v => {
        if (v.skipUi === false) {
          v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

          v.user.ui.timezone = v.timezone;

          let persistenceResult: Result.Result<void, DbErrorToError> =
            await dbErrorToResult({
              action: async () => {
                await retry(
                  async () =>
                    await this.db.drizzle.transaction(
                      async tx =>
                        await this.db.packer.write({
                          tx: tx,
                          insertOrUpdate: {
                            users: [v.user]
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
        }

        return Result.succeed();
      }),
      Result.bind(
        'apiUserMember',
        (v): Result.Result<Member, never> =>
          Result.succeed(this.membersService.tabToApi({ member: v.userMember }))
      ),
      Result.map(
        (v): ToBackendGetChartOutput => ({
          userMember: v.apiUserMember,
          chart: this.chartsService.tabToApi({
            chart: v.chart,
            mconfigs: [
              this.mconfigsService.tabToApi({
                mconfig: v.prepareQueryPayload.newMconfig,
                modelFields: v.model.fields
              })
            ],
            queries: [this.queriesService.tabToApi({ query: v.query })],
            member: v.apiUserMember,
            models: [
              this.modelsService.tabToApi({
                model: v.model,
                hasAccess: v.chartOrModelAccess.hasModelAccess
              })
            ],
            isAddMconfigAndQuery: true
          })
        })
      )
    );
  }
}
