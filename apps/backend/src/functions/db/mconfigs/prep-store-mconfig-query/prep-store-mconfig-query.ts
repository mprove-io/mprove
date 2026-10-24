import { Result } from '@praha/byethrow';
import { and, eq } from 'drizzle-orm';
import type {
  MconfigTab,
  ModelTab,
  ProjectTab,
  QueryTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { adjustMconfig } from '#backend/functions/db/mconfigs/prep-store-mconfig-query/adjust-mconfig/adjust-mconfig';
import { transformStoreRequest } from '#backend/functions/db/mconfigs/prep-store-mconfig-query/transform-store-request/transform-store-request';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import type { DbService } from '#backend/services/db/db.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { PrepStoreMconfigQueryError } from '#common/types/backend/function-errors/prep-store-mconfig-query-error';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { StoreMethod } from '#common/types/blockml/parts/store/store-method';
import { makeQueryId } from '#node-common/functions/make-query-id/make-query-id';

export type PrepStoreMconfigQueryOutput = {
  isError: boolean;
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

type PrepareStoreQueryPayload = {
  isError: boolean;
  apiUrlPath: any;
  connectionBaseUrl: string;
  apiUrl: string;
  apiBody: any;
  queryId: string;
  newQuery: QueryTab;
};

export async function prepStoreMconfigQuery(item: {
  struct: StructTab;
  project: ProjectTab;
  envId: string;
  mconfigParentType: MconfigParentType;
  mconfigParentId: string;
  model: ModelTab;
  mconfig: MconfigTab;
  metricsStartDateYYYYMMDD: string;
  metricsEndDateYYYYMMDD: string;
  db: DbService;
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
    Result.bind('newMconfig', async v => {
      return Result.succeed(
        await adjustMconfig({
          mconfig: v.mconfig,
          model: v.model,
          caseSensitiveStringFilters:
            v.struct.mproveConfig.caseSensitiveStringFilters,
          metricsStartDateYYYYMMDD: v.metricsStartDateYYYYMMDD,
          metricsEndDateYYYYMMDD: v.metricsEndDateYYYYMMDD
        })
      );
    }),
    Result.bind('apiEnvs', v =>
      getApiEnvs({
        db: v.db,
        projectId: v.project.projectId
      })
    ),
    Result.bind('apiEnv', v =>
      Result.succeed(v.apiEnvs.find(x => x.envId === v.envId))
    ),
    Result.bind('connection', v =>
      v.db.connections.findFirst({
        where: and(
          eq(connectionsTable.projectId, v.project.projectId),
          eq(
            connectionsTable.envId,
            v.apiEnv.fallbackConnectionIds.indexOf(v.model.connectionId) > -1
              ? PROJECT_ENV_PROD
              : v.envId
          ),
          eq(connectionsTable.connectionId, v.model.connectionId)
        )
      })
    ),
    Result.bind('processedRequest', async v => {
      return Result.succeed(
        await transformStoreRequest({
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
    }),
    Result.bind('prepareStoreQueryPayload', v => {
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
          v.mconfig.parentType === 'Report' ? v.mconfig.parentId : undefined,
        reportStructId:
          v.mconfig.parentType === 'Report' ? v.mconfig.structId : undefined,
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

      let prepareStoreQueryPayload: PrepareStoreQueryPayload = {
        isError: isError,
        apiUrlPath: apiUrlPath,
        connectionBaseUrl: connectionBaseUrl,
        apiUrl: apiUrl,
        apiBody: apiBody,
        queryId: queryId,
        newQuery: newQuery
      };

      return Result.succeed(prepareStoreQueryPayload);
    }),
    Result.map(
      (v): PrepStoreMconfigQueryOutput => ({
        isError: v.prepareStoreQueryPayload.isError,
        newMconfig: v.newMconfig,
        newQuery: v.prepareStoreQueryPayload.newQuery
      })
    )
  );
}
