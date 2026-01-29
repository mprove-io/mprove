import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MconfigTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '#backend/drizzle/postgres/schema/mconfigs';
import { makeMconfigFields } from '#backend/functions/make-mconfig-fields';
import { makeMconfigFiltersX } from '#backend/functions/make-mconfig-filters-x';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ParameterEnum } from '#common/enums/docs/parameter.enum';
import { ErEnum } from '#common/enums/er.enum';
import { MconfigParentTypeEnum } from '#common/enums/mconfig-parent-type.enum';
import { QueryStatusEnum } from '#common/enums/query-status.enum';
import { StoreMethodEnum } from '#common/enums/store-method.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { MconfigX } from '#common/interfaces/backend/mconfig-x';
import { Mconfig } from '#common/interfaces/blockml/mconfig';
import { ModelField } from '#common/interfaces/blockml/model-field';
import { ServerError } from '#common/models/server-error';
import { makeQueryId } from '#node-common/functions/make-query-id';
import { HashService } from '../hash.service';
import { StoreService } from '../store.service';
import { TabService } from '../tab.service';
import { EnvsService } from './envs.service';

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
      chart: apiMconfig.chart,
      keyTag: undefined,
      serverTs: apiMconfig.serverTs
    };

    return mconfig;
  }

  async getMconfigCheckExists(item: { mconfigId: string; structId: string }) {
    let { mconfigId, structId } = item;

    let mconfig = await this.db.drizzle.query.mconfigsTable
      .findFirst({
        where: and(
          eq(mconfigsTable.mconfigId, mconfigId),
          eq(mconfigsTable.structId, structId)
        )
      })
      .then(x => this.tabService.mconfigEntToTab(x));

    if (isUndefined(mconfig)) {
      throw new ServerError({
        message: ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST
      });
    }

    return mconfig;
  }

  async prepStoreMconfigQuery(item: {
    struct: StructTab;
    project: ProjectTab;
    envId: string;
    mconfigParentType: MconfigParentTypeEnum;
    mconfigParentId: string;
    model: ModelTab;
    mconfig: MconfigTab;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateYYYYMMDD: string;
  }): Promise<{
    isError: boolean;
    newMconfig: MconfigTab;
    newQuery: QueryTab;
  }> {
    let {
      model,
      struct,
      mconfig,
      project,
      envId,
      mconfigParentType,
      mconfigParentId,
      metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD
    } = item;

    mconfig.parentType = mconfigParentType;
    mconfig.parentId = mconfigParentId;

    let isError = false;
    let errorMessage: string;

    let newMconfig: MconfigTab = await this.storeService.adjustMconfig({
      mconfig: mconfig,
      model: model,
      caseSensitiveStringFilters:
        struct.mproveConfig.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD: metricsEndDateYYYYMMDD
    });

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: project.projectId
    });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connection = await this.db.drizzle.query.connectionsTable
      .findFirst({
        where: and(
          eq(connectionsTable.projectId, project.projectId),
          eq(
            connectionsTable.envId,
            apiEnv.fallbackConnectionIds.indexOf(model.connectionId) > -1
              ? PROJECT_ENV_PROD
              : envId
          ),
          eq(connectionsTable.connectionId, model.connectionId)
        )
      })
      .then(x => this.tabService.connectionEntToTab(x));

    let processedRequest = await this.storeService.transformStoreRequest({
      input: model.storeContent.request,
      mconfig: newMconfig,
      storeModel: model,
      storeParam: ParameterEnum.Request,
      caseSensitiveStringFilters:
        struct.mproveConfig.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: undefined,
      metricsEndDateYYYYMMDD: undefined
    });

    if (isDefined(processedRequest.errorMessage)) {
      isError = true;
      errorMessage = `store request processing Error: ${processedRequest.errorMessage}`;
    }

    let apiUrlPath =
      isError === true
        ? errorMessage
        : (JSON.parse(processedRequest.result) as any).urlPath;

    let connectionBaseUrl =
      connection.type === ConnectionTypeEnum.Api
        ? connection.options.storeApi.baseUrl
        : connection.type === ConnectionTypeEnum.GoogleApi
          ? connection.options.storeGoogleApi.baseUrl
          : '';

    let apiUrl =
      isError === true ? errorMessage : connectionBaseUrl + apiUrlPath;

    let apiBody =
      isError === true
        ? errorMessage
        : JSON.parse(processedRequest.result).body;

    let queryId = makeQueryId({
      projectId: project.projectId,
      connectionId: model.connectionId,
      envId: envId,
      mconfigParentType: mconfigParentType,
      mconfigParentId: mconfigParentId,
      sql: undefined,
      store: model.storeContent,
      storeTransformedRequestString: processedRequest.result
    });

    let newQuery: QueryTab = {
      queryId: queryId,
      projectId: project.projectId,
      envId: envId,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      reportId:
        mconfig.parentType === MconfigParentTypeEnum.Report
          ? mconfig.parentId
          : undefined,
      reportStructId:
        mconfig.parentType === MconfigParentTypeEnum.Report
          ? mconfig.structId
          : undefined,
      sql: undefined,
      apiMethod: model.storeContent.method as StoreMethodEnum,
      apiUrl: apiUrl,
      apiBody: apiBody,
      status: isError === true ? QueryStatusEnum.Error : QueryStatusEnum.New,
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
      keyTag: undefined,
      serverTs: 1
    };

    newMconfig.queryId = newQuery.queryId;
    newMconfig.storePart = {
      reqTemplate: model.storeContent.request,
      reqFunction: processedRequest.userCode,
      reqJsonParts: processedRequest.result,
      reqBody: JSON.stringify(apiBody),
      reqUrlPath: apiUrlPath
    };

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
