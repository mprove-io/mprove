import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type {
  MconfigTab,
  MemberTab,
  ProjectTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { modelsTable } from '#backend/drizzle/postgres/schema/models';
import { queriesTable } from '#backend/drizzle/postgres/schema/queries';
import { ChartsService } from '#backend/services/db/charts/charts.service';
import { DbService } from '#backend/services/db/db.service';
import type { PrepStoreMconfigQueryOutput } from '#backend/services/db/mconfigs/mconfigs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ModelsService } from '#backend/services/db/models/models.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import type { WriteOutput } from '#backend/services/db/write-output';
import type { EditMalloyQueryOutput } from '#backend/services/malloy/malloy.service';
import { MalloyService } from '#backend/services/malloy/malloy.service';
import { DEFAULT_SRV_UI } from '#common/constants/top-backend';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { GetChartDataError } from '#common/types/backend/function-errors/get-chart-data-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { WriteError } from '#common/types/backend/function-errors/write-error';
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
    private malloyService: MalloyService,
    private chartsService: ChartsService,
    private mconfigsService: MconfigsService,
    private modelsService: ModelsService,
    private queriesService: QueriesService,
    private membersService: MembersService,
    private structsService: StructsService,
    private db: DbService
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
      Result.bind('struct', v =>
        this.structsService.getStructCheckExists({
          structId: v.structId,
          projectId: v.projectId
        })
      ),
      Result.bind('chart', v =>
        this.chartsService.getChartCheckExists({
          structId: v.structId,
          chartId: v.chartId,
          userMember: v.userMember,
          user: v.user
        })
      ),
      Result.bind('chartMconfig', v =>
        this.db.mconfigs.findFirstCheckExists({
          where: and(
            eq(mconfigsTable.mconfigId, v.chart.tiles[0].mconfigId),
            eq(mconfigsTable.structId, v.structId)
          )
        })
      ),
      Result.bind('model', v =>
        this.db.models.findFirstCheckExists({
          where: and(
            eq(modelsTable.structId, v.structId),
            eq(modelsTable.modelId, v.chartMconfig.modelId)
          )
        })
      ),
      Result.bind('chartOrModelAccess', v =>
        this.chartsService.checkChartOrModelAccess({
          chart: v.chart,
          model: v.model,
          userMember: v.userMember
        })
      ),
      Result.bind('prepareQueryPayload', v => {
        let newMconfig: MconfigTab;

        let newQuery: QueryTab;

        let isError: boolean = false;

        let prepareQueryPayload: PrepareQueryPayload = {
          newMconfig: newMconfig,
          newQuery: newQuery,
          isError: isError
        };

        return Result.succeed(prepareQueryPayload);
      }),
      Result.andThrough(async v => {
        if (v.model.type === 'Store') {
          v.chartMconfig.timezone = v.timezone;

          let prepStoreMconfigQueryOutput: Result.Result<
            PrepStoreMconfigQueryOutput,
            PrepStoreMconfigQueryError
          > = await this.mconfigsService.prepStoreMconfigQuery({
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
          > = await this.malloyService.editMalloyQuery({
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
        let persistenceResult: Result.Result<WriteOutput, WriteError> =
          await this.db.write({
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
          });

        if (Result.isFailure(persistenceResult)) {
          return persistenceResult;
        }

        return Result.succeed();
      }),
      Result.bind('query', v =>
        this.db.queries.findFirst({
          where: and(
            eq(queriesTable.queryId, v.prepareQueryPayload.newQuery.queryId),
            eq(queriesTable.projectId, v.prepareQueryPayload.newQuery.projectId)
          )
        })
      ),
      Result.andThrough(v => {
        v.chart.tiles[0].mconfigId = v.prepareQueryPayload.newMconfig.mconfigId;
        v.chart.tiles[0].queryId = v.prepareQueryPayload.newMconfig.queryId;

        return Result.succeed();
      }),
      Result.andThrough(async v => {
        if (v.skipUi === false) {
          v.user.ui = v.user.ui || makeCopy(DEFAULT_SRV_UI);

          v.user.ui.timezone = v.timezone;

          let persistenceResult: Result.Result<WriteOutput, WriteError> =
            await this.db.write({
              insertOrUpdate: {
                users: [v.user]
              }
            });

          if (Result.isFailure(persistenceResult)) {
            return persistenceResult;
          }
        }

        return Result.succeed();
      }),
      Result.bind('apiUserMember', v =>
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
