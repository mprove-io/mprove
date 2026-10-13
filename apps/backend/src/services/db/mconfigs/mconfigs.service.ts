import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  MconfigTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { makeMconfigFields } from '#backend/services/db/mconfigs/make-mconfig-fields/make-mconfig-fields';
import { makeMconfigFiltersX } from '#backend/services/db/mconfigs/make-mconfig-filters-x/make-mconfig-filters-x';
import { HashService } from '#backend/services/hash/hash.service';
import type { StoreUserCodeReturn } from '#backend/services/store/store.service';
import { StoreService } from '#backend/services/store/store.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { ConnectionEntToTabError } from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetMconfigCheckExistsError } from '#common/types/backend/function-errors/get-mconfig-check-exists-error';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { Env } from '#common/types/backend/parts/env';
import type { MconfigX } from '#common/types/backend/parts/mconfig/mconfig-x';
import type { Mconfig } from '#common/types/blockml/parts/mconfig/mconfig';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { ModelField } from '#common/types/blockml/parts/model/model-field';
import type { StoreMethod } from '#common/types/blockml/parts/store/store-method';
import { makeQueryId } from '#node-common/functions/make-query-id/make-query-id';

type PrepareStoreQueryPayload = {
  isError: boolean;
  apiUrlPath: any;
  connectionBaseUrl: string;
  apiUrl: string;
  apiBody: any;
  queryId: string;
  newQuery: QueryTab;
};

export type PrepStoreMconfigQueryOutput = {
  isError: boolean;
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

@Injectable()
export class MconfigsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private envsService: EnvsService,
    private storeService: StoreService,
    private cs: ConfigService<BackendConfig>,
    @Inject(DRIZZLE) private db: Db
  ) {}

  tabToApi(item: { mconfig: MconfigTab; modelFields: ModelField[] }): MconfigX {
    let { mconfig, modelFields } = item;

    let mconfigX: MconfigX = {
      structId: mconfig.structId,
      mconfigId: mconfig.mconfigId,
      queryId: mconfig.queryId,
      modelId: mconfig.modelId,
      modelType: mconfig.modelType,
      parentType: mconfig.parentType,
      parentId: mconfig.parentId,
      dateRangeIncludesRightSide: mconfig.dateRangeIncludesRightSide,
      storePart: mconfig.storePart,
      modelLabel: mconfig.modelLabel,
      modelFilePath: mconfig.modelFilePath,
      malloyQueryStable: mconfig.malloyQueryStable,
      malloyQueryExtra: mconfig.malloyQueryExtra,
      compiledQuery: mconfig.compiledQuery,
      select: mconfig.select,
      fields: makeMconfigFields({
        modelFields: modelFields,
        select: mconfig.select,
        sortings: mconfig.sortings,
        chart: mconfig.chart
      }),
      extendedFilters: makeMconfigFiltersX({
        modelFields: modelFields,
        mconfigFilters: mconfig.filters
      }),
      sortings: mconfig.sortings,
      sorts: mconfig.sorts,
      timezone: mconfig.timezone,
      limit: mconfig.limit,
      filters: mconfig.filters,
      appliedGivens: mconfig.appliedGivens,
      chart: mconfig.chart,
      serverTs: mconfig.serverTs
    };

    return mconfigX;
  }

  apiToTab(item: { apiMconfig: Mconfig }): MconfigTab {
    let { apiMconfig } = item;

    if (isUndefined(apiMconfig)) {
      return;
    }

    let mconfig: MconfigTab = {
      structId: apiMconfig.structId,
      queryId: apiMconfig.queryId,
      mconfigId: apiMconfig.mconfigId,
      modelId: apiMconfig.modelId,
      modelType: apiMconfig.modelType,
      parentType: apiMconfig.parentType,
      parentId: apiMconfig.parentId,
      dateRangeIncludesRightSide: apiMconfig.dateRangeIncludesRightSide,
      storePart: apiMconfig.storePart,
      modelLabel: apiMconfig.modelLabel,
      modelFilePath: apiMconfig.modelFilePath,
      malloyQueryStable: apiMconfig.malloyQueryStable,
      malloyQueryExtra: apiMconfig.malloyQueryExtra,
      compiledQuery: apiMconfig.compiledQuery,
      select: apiMconfig.select,
      sortings: apiMconfig.sortings,
      sorts: apiMconfig.sorts,
      timezone: apiMconfig.timezone,
      limit: apiMconfig.limit,
      filters: apiMconfig.filters,
      appliedGivens: apiMconfig.appliedGivens,
      chart: apiMconfig.chart,
      sessionId: undefined,
      keyTag: undefined,
      serverTs: apiMconfig.serverTs
    };

    return mconfig;
  }

  async getMconfigCheckExists(item: {
    mconfigId: string;
    structId: string;
  }): Promise<MconfigTab> {
    let { mconfigId, structId } = item;

    let result: Result.Result<MconfigTab, GetMconfigCheckExistsError> =
      await this.getMconfigCheckExistsResult({
        mconfigId: mconfigId,
        structId: structId
      });

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let mconfig: MconfigTab = result.value;

    return mconfig;
  }

  async getMconfigCheckExistsResult(item: {
    mconfigId: string;
    structId: string;
  }): Result.ResultAsync<MconfigTab, GetMconfigCheckExistsError> {
    let { mconfigId, structId } = item;

    return this.db.drizzle.query.mconfigsTable
      .findFirst({
        where: and(
          eq(mconfigsTable.mconfigId, mconfigId),
          eq(mconfigsTable.structId, structId)
        )
      })
      .then(x =>
        isUndefined(x)
          ? Result.fail({ code: 'BACKEND_MCONFIG_DOES_NOT_EXIST' })
          : isUndefined(x)
            ? Result.succeed(undefined)
            : this.tabService.mconfigEntToTabResult({ mconfigEnt: x })
      );
  }

  async prepStoreMconfigQuery(item: {
    struct: StructTab;
    project: ProjectTab;
    envId: string;
    mconfigParentType: MconfigParentType;
    mconfigParentId: string;
    model: ModelTab;
    mconfig: MconfigTab;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateYYYYMMDD: string;
  }): Promise<PrepStoreMconfigQueryOutput> {
    let {
      struct,
      project,
      envId,
      mconfigParentType,
      mconfigParentId,
      model,
      mconfig,
      metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD
    } = item;

    let result: Result.Result<
      PrepStoreMconfigQueryOutput,
      PrepStoreMconfigQueryError
    > = await this.prepStoreMconfigQueryResult({
      struct: struct,
      project: project,
      envId: envId,
      mconfigParentType: mconfigParentType,
      mconfigParentId: mconfigParentId,
      model: model,
      mconfig: mconfig,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD: metricsEndDateYYYYMMDD
    });

    if (Result.isFailure(result)) {
      throw new ServerError({
        message: result.error.code,
        displayData:
          'displayData' in result.error ? result.error.displayData : undefined,
        customData: 'info' in result.error ? result.error.info : undefined
      });
    }

    let output: PrepStoreMconfigQueryOutput = result.value;

    return output;
  }

  async prepStoreMconfigQueryResult(item: {
    struct: StructTab;
    project: ProjectTab;
    envId: string;
    mconfigParentType: MconfigParentType;
    mconfigParentId: string;
    model: ModelTab;
    mconfig: MconfigTab;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateYYYYMMDD: string;
  }): Result.ResultAsync<
    PrepStoreMconfigQueryOutput,
    PrepStoreMconfigQueryError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.map(v => {
        v.mconfig.parentType = v.mconfigParentType;
        v.mconfig.parentId = v.mconfigParentId;
        return v;
      }),
      Result.bind(
        'newMconfig',
        async (v): Result.ResultAsync<MconfigTab, never> => {
          return Result.succeed(
            await this.storeService.adjustMconfig({
              mconfig: v.mconfig,
              model: v.model,
              caseSensitiveStringFilters:
                v.struct.mproveConfig.caseSensitiveStringFilters,
              metricsStartDateYYYYMMDD: v.metricsStartDateYYYYMMDD,
              metricsEndDateYYYYMMDD: v.metricsEndDateYYYYMMDD
            })
          );
        }
      ),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          this.envsService.getApiEnvsResult({
            projectId: v.project.projectId
          })
      ),
      Result.bind(
        'apiEnv',
        (v): Result.Result<Env, never> =>
          Result.succeed(v.apiEnvs.find(x => x.envId === v.envId))
      ),
      Result.bind(
        'connection',
        (v): Result.ResultAsync<ConnectionTab, ConnectionEntToTabError> =>
          this.db.drizzle.query.connectionsTable
            .findFirst({
              where: and(
                eq(connectionsTable.projectId, v.project.projectId),
                eq(
                  connectionsTable.envId,
                  v.apiEnv.fallbackConnectionIds.indexOf(v.model.connectionId) >
                    -1
                    ? PROJECT_ENV_PROD
                    : v.envId
                ),
                eq(connectionsTable.connectionId, v.model.connectionId)
              )
            })
            .then(x =>
              isUndefined(x)
                ? Result.succeed(undefined)
                : this.tabService.connectionEntToTabResult({
                    connectionEnt: x
                  })
            )
      ),
      Result.bind(
        'processedRequest',
        async (v): Result.ResultAsync<StoreUserCodeReturn, never> => {
          return Result.succeed(
            await this.storeService.transformStoreRequest({
              input: v.model.storeContent.request,
              mconfig: v.newMconfig,
              storeModel: v.model,
              storeParam: 'request',
              caseSensitiveStringFilters:
                v.struct.mproveConfig.caseSensitiveStringFilters,
              metricsStartDateYYYYMMDD: undefined,
              metricsEndDateYYYYMMDD: undefined
            })
          );
        }
      ),
      Result.bind(
        'prepareStoreQueryPayload',
        (v): Result.Result<PrepareStoreQueryPayload, never> => {
          let isError: boolean = false;

          let errorMessage: string;

          if (isDefined(v.processedRequest.errorMessage)) {
            isError = true;

            errorMessage = `store request processing Error: ${v.processedRequest.errorMessage}`;
          }

          let apiUrlPath: any =
            isError === true
              ? errorMessage
              : (JSON.parse(v.processedRequest.result) as any).urlPath;

          let connectionBaseUrl: string =
            v.connection.type === 'Api'
              ? v.connection.options.storeApi.baseUrl
              : v.connection.type === 'GoogleApi'
                ? v.connection.options.storeGoogleApi.baseUrl
                : '';

          let apiUrl: string =
            isError === true ? errorMessage : connectionBaseUrl + apiUrlPath;

          let apiBody: any =
            isError === true
              ? errorMessage
              : JSON.parse(v.processedRequest.result).body;

          let queryId: string = makeQueryId({
            projectId: v.project.projectId,
            connectionId: v.model.connectionId,
            envId: v.envId,
            mconfigParentType: v.mconfigParentType,
            mconfigParentId: v.mconfigParentId,
            sql: undefined,
            store: v.model.storeContent,
            storeTransformedRequestString: v.processedRequest.result
          });

          let newQuery: QueryTab = {
            queryId: queryId,
            projectId: v.project.projectId,
            envId: v.envId,
            connectionId: v.model.connectionId,
            connectionType: v.model.connectionType,
            reportId:
              v.mconfig.parentType === 'Report'
                ? v.mconfig.parentId
                : undefined,
            reportStructId:
              v.mconfig.parentType === 'Report'
                ? v.mconfig.structId
                : undefined,
            sql: undefined,
            apiMethod: v.model.storeContent.method as StoreMethod,
            apiUrl: apiUrl,
            apiBody: apiBody,
            status: isError === true ? 'Error' : 'New',
            lastRunBy: undefined,
            lastRunTs: undefined,
            lastCancelTs: undefined,
            lastCompleteTs: undefined,
            lastCompleteDuration: undefined,
            lastErrorMessage: errorMessage,
            lastErrorTs: isError === true ? makeTsNumber() : undefined,
            data: undefined,
            queryJobId: undefined,
            bigqueryQueryJobId: undefined,
            bigqueryConsecutiveErrorsGetJob: 0,
            bigqueryConsecutiveErrorsGetResults: 0,
            apiUrlHash: undefined, // tab-to-ent
            sessionId: undefined,
            keyTag: undefined,
            serverTs: 1
          };

          v.newMconfig.queryId = newQuery.queryId;

          v.newMconfig.storePart = {
            reqTemplate: v.model.storeContent.request,
            reqFunction: v.processedRequest.userCode,
            reqJsonParts: v.processedRequest.result,
            reqBody: JSON.stringify(apiBody),
            reqUrlPath: apiUrlPath
          };

          return Result.succeed({
            isError: isError,
            apiUrlPath: apiUrlPath,
            connectionBaseUrl: connectionBaseUrl,
            apiUrl: apiUrl,
            apiBody: apiBody,
            queryId: queryId,
            newQuery: newQuery
          });
        }
      ),
      Result.map(
        (v): PrepStoreMconfigQueryOutput => ({
          isError: v.prepareStoreQueryPayload.isError,
          newMconfig: v.newMconfig,
          newQuery: v.prepareStoreQueryPayload.newQuery
        })
      )
    );
  }
}
