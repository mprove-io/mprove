import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { TabService } from '#backend/services/tab/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ConnectionEntToTabError } from '#common/types/backend/function-errors/connection-ent-to-tab-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetConnectionsListError } from '#common/types/backend/function-errors/get-connections-list-error';
import type { ConnectionItem } from '#common/types/backend/parts/connections/connection-item';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendGetConnectionsListOutput } from '#common/types/backend/routes/connections/get-connections-list/get-connections-list-output';

@Injectable()
export class GetConnectionsListService {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getConnectionsListResult(item: {
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
        this.projectsService.getProjectCheckExists({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsError> =>
          this.envsService.getApiEnvs({ projectId: v.projectId })
      ),
      Result.bind(
        'apiEnv',
        (v): Result.Result<Env, never> =>
          Result.succeed(v.apiEnvs.find(apiEnv => apiEnv.envId === v.envId))
      ),
      Result.bind(
        'connections',
        (v): Result.ResultAsync<ConnectionTab[], ConnectionEntToTabError> =>
          this.db.drizzle.query.connectionsTable
            .findMany({
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
            .then(xs =>
              Result.sequence(xs, x =>
                this.tabService.connectionEntToTab({
                  connectionEnt: x
                })
              )
            )
      ),
      Result.bind(
        'connectionItems',
        (v): Result.Result<ConnectionItem[], never> => {
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
        }
      ),
      Result.map(
        (v): ToBackendGetConnectionsListOutput => ({
          connectionItems: v.connectionItems
        })
      )
    );
  }
}
