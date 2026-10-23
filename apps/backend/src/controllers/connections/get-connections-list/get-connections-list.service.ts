import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { DbService } from '#backend/services/db/db.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { GetConnectionsListError } from '#common/types/backend/function-errors/get-connections-list-error';
import type { ConnectionItem } from '#common/types/backend/parts/connections/connection-item';
import type { ToBackendGetConnectionsListOutput } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-output';

@Injectable()
export class GetConnectionsListService {
  constructor(
    private membersService: MembersService,
    private db: DbService
  ) {}

  async getConnectionsList(item: {
    userId: string;
    projectId: string;
    envId: string;
  }): Result.ResultAsync<
    ToBackendGetConnectionsListOutput,
    GetConnectionsListError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.bind('apiEnv', v =>
        Result.succeed(v.apiEnvs.find(apiEnv => apiEnv.envId === v.envId))
      ),
      Result.bind('connections', v =>
        this.db.connections.findMany({
          where: and(
            eq(connectionsTable.projectId, v.projectId),
            or(
              eq(connectionsTable.envId, v.envId),
              and(
                eq(connectionsTable.envId, PROJECT_ENV_PROD),
                inArray(
                  connectionsTable.connectionId,
                  v.apiEnv.fallbackConnectionIds
                )
              )
            )
          )
        })
      ),
      Result.bind('connectionItems', v => {
        let connectionItems: ConnectionItem[] = [];

        v.connections.forEach(connection => {
          if (connection.type === 'Api') {
            let storeApi = connection.options.storeApi;

            if (isDefined(storeApi)) {
              let headerKeys: string[] = isDefined(storeApi.headers)
                ? storeApi.headers.map(h => h.key)
                : [];

              connectionItems.push({
                connectionId: connection.connectionId,
                type: connection.type,
                baseUrl: storeApi.baseUrl,
                headerKeys: headerKeys
              });
            }
          } else if (connection.type === 'GoogleApi') {
            let storeGoogleApi = connection.options.storeGoogleApi;

            if (isDefined(storeGoogleApi)) {
              let headerKeys: string[] = isDefined(storeGoogleApi.headers)
                ? storeGoogleApi.headers.map(h => h.key)
                : [];

              connectionItems.push({
                connectionId: connection.connectionId,
                type: connection.type,
                baseUrl: storeGoogleApi.baseUrl,
                headerKeys: headerKeys,
                googleAuthScopes: storeGoogleApi.googleAuthScopes
              });
            }
          } else {
            connectionItems.push({
              connectionId: connection.connectionId,
              type: connection.type
            });
          }
        });

        return Result.succeed(connectionItems);
      }),
      Result.map(
        (v): ToBackendGetConnectionsListOutput => ({
          connectionItems: v.connectionItems
        })
      )
    );
  }
}
