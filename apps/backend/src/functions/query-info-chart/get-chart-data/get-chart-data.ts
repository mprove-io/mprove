import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { MconfigTab } from '#backend/drizzle/postgres/tables/mconfigs';
import { mconfigsTable } from '#backend/drizzle/postgres/tables/mconfigs';
import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { modelsTable } from '#backend/drizzle/postgres/tables/models';
import type { ProjectTab } from '#backend/drizzle/postgres/tables/projects';
import type { QueryTab } from '#backend/drizzle/postgres/tables/queries';
import { queriesTable } from '#backend/drizzle/postgres/tables/queries';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { chartTabToApi } from '#backend/functions/db/charts/chart-tab-to-api/chart-tab-to-api';
import { checkChartOrModelAccess } from '#backend/functions/db/charts/check-chart-or-model-access/check-chart-or-model-access';
import { getChartCheckExists } from '#backend/functions/db/charts/get-chart-check-exists/get-chart-check-exists';
import { mconfigTabToApi } from '#backend/functions/db/mconfigs/mconfig-tab-to-api/mconfig-tab-to-api';
import {
  type PrepStoreMconfigQueryOutput,
  prepStoreMconfigQuery
} from '#backend/functions/db/mconfigs/prep-store-mconfig-query/prep-store-mconfig-query';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { modelTabToApi } from '#backend/functions/db/models/model-tab-to-api/model-tab-to-api';
import { queryTabToApi } from '#backend/functions/db/queries/query-tab-to-api/query-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import {
  type EditMalloyQueryOutput,
  editMalloyQuery
} from '#backend/functions/malloy/edit-malloy-query/edit-malloy-query';
import type { DbService } from '#backend/services/db/db.service';
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

export async function getChartData(item: {
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
  db: DbService;
  cs: ConfigService<BackendConfig>;
  logger: Logger;
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
      getStructCheckExists({
        structId: v.structId,
        projectId: v.projectId,
        cs: v.cs,
        db: v.db
      })
    ),
    Result.bind('chart', v =>
      getChartCheckExists({
        db: v.db,
        structId: v.structId,
        chartId: v.chartId,
        userMember: v.userMember,
        user: v.user
      })
    ),
    Result.bind('chartMconfig', v =>
      v.db.mconfigs.findFirstCheckExists({
        where: and(
          eq(mconfigsTable.mconfigId, v.chart.tiles[0].mconfigId),
          eq(mconfigsTable.structId, v.structId)
        )
      })
    ),
    Result.bind('model', v =>
      v.db.models.findFirstCheckExists({
        where: and(
          eq(modelsTable.structId, v.structId),
          eq(modelsTable.modelId, v.chartMconfig.modelId)
        )
      })
    ),
    Result.bind('chartOrModelAccess', v =>
      checkChartOrModelAccess({
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
        > = await prepStoreMconfigQuery({
          struct: v.struct,
          project: v.project,
          envId: v.envId,
          mconfigParentType: v.chartMconfig.parentType,
          mconfigParentId: v.chartMconfig.parentId,
          model: v.model,
          mconfig: v.chartMconfig,
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
        > = await editMalloyQuery({
          projectId: v.projectId,
          envId: v.envId,
          structId: v.struct.structId,
          mconfigParentType: v.chartMconfig.parentType,
          mconfigParentId: v.chartMconfig.parentId,
          user: v.user,
          model: v.model,
          mconfig: v.chartMconfig,
          queryOperations: [queryOperation],
          db: v.db,
          logger: v.logger,
          cs: v.cs
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
      let persistenceResult: Result.Result<void, WriteError> = await v.db.write(
        {
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
        }
      );

      if (Result.isFailure(persistenceResult)) {
        return persistenceResult;
      }

      return Result.succeed();
    }),
    Result.bind('query', v =>
      v.db.queries.findFirst({
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

        let persistenceResult: Result.Result<void, WriteError> =
          await v.db.write({
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
      Result.succeed(
        memberTabToApi({
          member: v.userMember
        })
      )
    ),
    Result.map(
      (v): ToBackendGetChartOutput => ({
        userMember: v.apiUserMember,
        chart: chartTabToApi({
          chart: v.chart,
          mconfigs: [
            mconfigTabToApi({
              mconfig: v.prepareQueryPayload.newMconfig,
              modelFields: v.model.fields
            })
          ],
          queries: [
            queryTabToApi({
              query: v.query
            })
          ],
          member: v.apiUserMember,
          models: [
            modelTabToApi({
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
