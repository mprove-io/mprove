import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import type { BackendConfig } from '#backend/config/backend-config';
import type {
  ConnectionTab,
  MconfigTab,
  QueryTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { logToConsoleBackend } from '#backend/functions/top/log-to-console-backend/log-to-console-backend';
import { ConnectionsService } from '#backend/services/db/connections/connections.service';
import { DbService } from '#backend/services/db/db.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MconfigsService } from '#backend/services/db/mconfigs/mconfigs.service';
import { QueriesService } from '#backend/services/db/queries/queries.service';
import { UsersService } from '#backend/services/db/users/users.service';
import { ServerError } from '#common/classes/server-error/server-error';
import type { EditMalloyQueryError } from '#common/types/backend/function-errors/edit-malloy-query-error';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';
import type { QueryOperation } from '#common/types/backend/parts/query-operation/query-operation';
import type { MconfigParentType } from '#common/types/blockml/parts/mconfig/mconfig-parent-type';
import type { Model } from '#common/types/blockml/parts/model/model';
import { addTraceSpan } from '#node-common/functions/add-trace-span/add-trace-span';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { makeMalloyConnections } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { makeMalloyQuery } from '#node-common/functions/malloy/make-malloy-query/make-malloy-query';

type ResolveQueryConnectionsPayload = {
  connection: ConnectionTab;
  projectConnection: ProjectConnection;
  malloyConnections: MalloyConnection[];
};

type PrepareQueryPayload = {
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

export type EditMalloyQueryOutput = {
  isError: boolean;
  newMconfig: MconfigTab;
  newQuery: QueryTab;
};

@Injectable()
export class MalloyService {
  constructor(
    private envsService: EnvsService,
    private mconfigsService: MconfigsService,
    private queriesService: QueriesService,
    private connectionsService: ConnectionsService,
    private usersService: UsersService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    private db: DbService
  ) {}

  async editMalloyQuery(item: {
    projectId: string;
    envId: string;
    structId: string;
    mconfigParentType: MconfigParentType;
    mconfigParentId: string;
    user: UserTab;
    model: Model;
    mconfig: MconfigTab;
    queryOperations: QueryOperation[];
  }): Result.ResultAsync<EditMalloyQueryOutput, EditMalloyQueryError> {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v => {
        v.mconfig.parentType = v.mconfigParentType;

        v.mconfig.parentId = v.mconfigParentId;

        return Result.succeed();
      }),
      Result.bind('getApiEnvConnectionsWithFallbackOutput', v =>
        this.envsService.getApiEnvConnectionsWithFallback({
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.bind('resolveQueryConnectionsPayload', v => {
        let connection: ConnectionTab =
          v.getApiEnvConnectionsWithFallbackOutput.connectionsWithFallback.find(
            x => x.connectionId === v.model.connectionId
          );

        let projectConnection: ProjectConnection =
          this.connectionsService.tabToApiProjectConnection({
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
        this.usersService.getSelectedGivens({
          user: v.user,
          projectId: v.projectId
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
        let newMconfig: MconfigTab = this.mconfigsService.apiToTab({
          apiMconfig: v.makeMalloyQueryOutput.apiNewMconfig
        });

        let newQuery: QueryTab = this.queriesService.apiToTab({
          apiQuery: v.makeMalloyQueryOutput.apiNewQuery
        });

        v.resolveQueryConnectionsPayload.malloyConnections.forEach(
          connection => {
            void connection.close().catch(er => {
              logToConsoleBackend({
                log: new ServerError({
                  message: 'BACKEND_MALLOY_CONNECTION_CLOSE_ERROR',
                  originalError: er
                }),
                logLevel: 'Error',
                logger: this.logger,
                cs: this.cs
              });
            });
          }
        );

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
}
