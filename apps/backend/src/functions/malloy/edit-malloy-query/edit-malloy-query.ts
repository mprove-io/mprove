import type { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  ConnectionTab,
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { tabToApiProjectConnection } from '#backend/functions/db/connections/tab-to-api-project-connection/tab-to-api-project-connection';
import { getApiEnvConnectionsWithFallback } from '#backend/functions/db/envs/get-api-env-connections-with-fallback/get-api-env-connections-with-fallback';
import { mconfigApiToTab } from '#backend/functions/db/mconfigs/mconfig-api-to-tab/mconfig-api-to-tab';
import { queryApiToTab } from '#backend/functions/db/queries/query-api-to-tab/query-api-to-tab';
import { getSelectedGivens } from '#backend/functions/db/users/get-selected-givens/get-selected-givens';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import type { DbService } from '#backend/services/db/db.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';
import {
  type MalloyConnection,
  makeMalloyConnections
} from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { makeMalloyQuery } from '#node-common/functions/malloy/make-malloy-query/make-malloy-query';

export type EditMalloyQueryOutput = {
  isError: boolean;
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

type PrepareQueryPayload = {
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

type ResolveQueryConnectionsPayload = {
  connection: ConnectionTab;
  projectConnection: ProjectConnection;
  malloyConnections: MalloyConnection[];
};

export async function editMalloyQuery(item: {
  projectId: string;
  envId: string;
  structId: string;
  mconfigParentType: MconfigParentType;
  mconfigParentId: string;
  user: UserTab;
  model: Model;
  mconfig: MconfigTab;
  queryOperations: QueryOperation[];
  db: DbService;
  logger: Logger;
  cs: ConfigService<BackendConfig>;
}): Result.ResultAsync<EditMalloyQueryOutput, EditMalloyQueryError> {
  return Result.pipe(
    Result.succeed(item),
    Result.andThrough(v => {
      v.mconfig.parentType = v.mconfigParentType;

      v.mconfig.parentId = v.mconfigParentId;

      return Result.succeed();
    }),
    Result.bind('getApiEnvConnectionsWithFallbackOutput', v =>
      getApiEnvConnectionsWithFallback({
        db: v.db,
        projectId: v.projectId,
        envId: v.envId
      })
    ),
    Result.bind('resolveQueryConnectionsPayload', v => {
      let connection: ConnectionTab =
        v.getApiEnvConnectionsWithFallbackOutput.connectionsWithFallback.find(
          x => x.connectionId === v.model.connectionId
        );

      let projectConnection: ProjectConnection = tabToApiProjectConnection({
        connection: connection,
        isIncludePasswords: true
      });

      let malloyConnections: MalloyConnection[] = makeMalloyConnections({
        connections: [projectConnection]
      });

      let resolveQueryConnectionsPayload: ResolveQueryConnectionsPayload = {
        connection: connection,
        projectConnection: projectConnection,
        malloyConnections: malloyConnections
      };

      return Result.succeed(resolveQueryConnectionsPayload);
    }),
    Result.bind('selectedGivens', v =>
      getSelectedGivens({
        user: v.user,
        projectId: v.projectId,
        db: v.db
      })
    ),
    Result.bind('makeMalloyQueryOutput', v =>
      addTraceSpan({
        spanName: 'backend.makeMalloyQuery',
        fn: () =>
          makeMalloyQuery({
            projectId: v.projectId,
            envId: v.envId,
            structId: v.structId,
            mconfigParentType: v.mconfigParentType,
            mconfigParentId: v.mconfigParentId,
            model: v.model,
            mconfig: v.mconfig,
            queryOperations: v.queryOperations,
            malloyConnections:
              v.resolveQueryConnectionsPayload.malloyConnections,
            selectedGivens: v.selectedGivens
          })
      })
    ),
    Result.bind('prepareQueryPayload', v => {
      let newMconfig: MconfigTab = mconfigApiToTab({
        apiMconfig: v.makeMalloyQueryOutput.apiNewMconfig
      });

      let newQuery: QueryTab = queryApiToTab({
        apiQuery: v.makeMalloyQueryOutput.apiNewQuery
      });

      v.resolveQueryConnectionsPayload.malloyConnections.forEach(connection => {
        void connection.close().catch(er => {
          logToConsoleBackend({
            log: new ServerError({
              message: 'BACKEND_MALLOY_CONNECTION_CLOSE_ERROR',
              originalError: er
            }),
            logLevel: 'Error',
            logger: v.logger,
            cs: v.cs
          });
        });
      });

      let prepareQueryPayload: PrepareQueryPayload = {
        newMconfig: newMconfig,
        newQuery: newQuery
      };

      return Result.succeed(prepareQueryPayload);
    }),
    Result.map(
      (v): EditMalloyQueryOutput => ({
        isError: v.makeMalloyQueryOutput.isError,
        newMconfig: v.prepareQueryPayload.newMconfig,
        newQuery: v.prepareQueryPayload.newQuery
      })
    )
  );
}
