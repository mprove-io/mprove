import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, or } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { TabService } from '#backend/services/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ConnectionItem } from '#common/interfaces/to-backend/connections/connection-item';

@Injectable()
export class GetConnectionsListService {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getConnectionsList(item: {
    userId: string;
    projectId: string;
    envId: string;
  }): Promise<{
    connectionItems: ConnectionItem[];
  }> {
    let { userId, projectId, envId } = item;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: userId,
      projectId: projectId
    });

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: projectId
    });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connections: ConnectionTab[] =
      await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            or(
              eq(connectionsTable.envId, envId),
              and(
                eq(connectionsTable.envId, PROJECT_ENV_PROD),
                inArray(
                  connectionsTable.connectionId,
                  apiEnv.fallbackConnectionIds
                )
              )
            )
          )
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));

    let connectionItems: ConnectionItem[] = [];

    connections.forEach(connection => {
      if (connection.type === ConnectionTypeEnum.Api) {
        let storeApi = connection.options.storeApi;

        if (isDefined(storeApi)) {
          let headerKeys = isDefined(storeApi.headers)
            ? storeApi.headers.map(h => h.key)
            : [];

          connectionItems.push({
            connectionId: connection.connectionId,
            type: connection.type,
            baseUrl: storeApi.baseUrl,
            headerKeys: headerKeys
          });
        }
      } else if (connection.type === ConnectionTypeEnum.GoogleApi) {
        let storeGoogleApi = connection.options.storeGoogleApi;

        if (isDefined(storeGoogleApi)) {
          let headerKeys = isDefined(storeGoogleApi.headers)
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

    return {
      connectionItems: connectionItems
    };
  }
}
