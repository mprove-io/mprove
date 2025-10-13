import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { ConnectionTab } from '~backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { ConnectionEnt } from '~backend/drizzle/postgres/schema/connections';
import { DEFAULT_QUERY_SIZE_LIMIT } from '~common/constants/top-backend';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { BaseConnection } from '~common/interfaces/backend/base-connection';
import { ConnectionOptions } from '~common/interfaces/backend/connection-parts/connection-options';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { ConnectionLt, ConnectionSt } from '~common/interfaces/st-lt';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class ConnectionsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  entToTab(connectionEnt: ConnectionEnt): ConnectionTab {
    if (isUndefined(connectionEnt)) {
      return;
    }

    let connection: ConnectionTab = {
      ...connectionEnt,
      ...this.tabService.getTabProps({ ent: connectionEnt })
    };

    return connection;
  }

  makeConnection(item: {
    projectId: string;
    connectionId: string;
    envId: string;
    type: ConnectionTypeEnum;
    options: ConnectionOptions;
  }): ConnectionTab {
    let { projectId, connectionId, envId, type, options } = item;

    if (isDefined(options.storeGoogleApi)) {
      options.storeGoogleApi.googleCloudProject =
        options.storeGoogleApi.serviceAccountCredentials?.project_id;

      options.storeGoogleApi.googleCloudClientEmail =
        options.storeGoogleApi.serviceAccountCredentials?.client_email;
    }

    if (isDefined(options.bigquery)) {
      options.bigquery.googleCloudProject =
        options.bigquery.serviceAccountCredentials?.project_id;

      options.bigquery.googleCloudClientEmail =
        options.bigquery.serviceAccountCredentials?.client_email;

      let slimit = options.bigquery.bigqueryQuerySizeLimitGb;

      options.bigquery.bigqueryQuerySizeLimitGb =
        isDefined(slimit) && slimit > 0 ? slimit : DEFAULT_QUERY_SIZE_LIMIT;
    }

    let connection: ConnectionTab = {
      connectionFullId: this.hashService.makeConnectionFullId({
        projectId: projectId,
        envId: envId,
        connectionId: connectionId
      }),
      projectId: projectId,
      envId: envId,
      connectionId: connectionId,
      type: type,
      options: options,
      serverTs: undefined
    };

    return connection;
  }

  tabToApiProjectConnection(item: {
    connection: ConnectionTab;
    isIncludePasswords: boolean;
  }): ProjectConnection {
    let { connection, isIncludePasswords } = item;

    let options = connection.options;

    let apiProjectConnection: ProjectConnection = {
      projectId: connection.projectId,
      connectionId: connection.connectionId,
      envId: connection.envId,
      type: connection.type,
      options: {
        bigquery: isDefined(options.bigquery)
          ? {
              serviceAccountCredentials:
                isIncludePasswords === true
                  ? options.bigquery.serviceAccountCredentials
                  : undefined,
              googleCloudProject: options.bigquery.googleCloudProject,
              googleCloudClientEmail: options.bigquery.googleCloudClientEmail,
              bigqueryQuerySizeLimitGb:
                options.bigquery.bigqueryQuerySizeLimitGb
            }
          : undefined,
        clickhouse: isDefined(options.clickhouse)
          ? {
              host: options.clickhouse.host,
              port: options.clickhouse.port,
              username: options.clickhouse.username,
              password:
                isIncludePasswords === true
                  ? options.clickhouse.password
                  : undefined,
              isSSL: options.clickhouse.isSSL
            }
          : undefined,
        motherduck: isDefined(options.motherduck)
          ? {
              motherduckToken:
                isIncludePasswords === true
                  ? options.motherduck.motherduckToken
                  : undefined,
              database: options.motherduck.database,
              attachModeSingle: options.motherduck.attachModeSingle,
              accessModeReadOnly: options.motherduck.accessModeReadOnly
            }
          : undefined,
        postgres: isDefined(options.postgres)
          ? {
              host: options.postgres.host,
              port: options.postgres.port,
              database: options.postgres.database,
              username: options.postgres.username,
              password:
                isIncludePasswords === true
                  ? options.postgres.password
                  : undefined,
              isSSL: options.postgres.isSSL
            }
          : undefined,
        mysql: isDefined(options.mysql)
          ? {
              host: options.mysql.host,
              port: options.mysql.port,
              database: options.mysql.database,
              user: options.mysql.user,
              password:
                isIncludePasswords === true ? options.mysql.password : undefined
            }
          : undefined,
        trino: isDefined(options.trino)
          ? {
              server: options.trino.server,
              catalog: options.trino.catalog,
              schema: options.trino.schema,
              user: options.trino.user,
              password:
                isIncludePasswords === true ? options.trino.password : undefined
            }
          : undefined,
        presto: isDefined(options.presto)
          ? {
              server: options.presto.server,
              port: options.presto.port,
              catalog: options.presto.catalog,
              schema: options.presto.schema,
              user: options.presto.user,
              password:
                isIncludePasswords === true
                  ? options.presto.password
                  : undefined
            }
          : undefined,
        snowflake: isDefined(options.snowflake)
          ? {
              account: options.snowflake.account,
              warehouse: options.snowflake.warehouse,
              database: options.snowflake.database,
              username: options.snowflake.username,
              password:
                isIncludePasswords === true
                  ? options.snowflake.password
                  : undefined
            }
          : undefined,
        storeApi: isDefined(options.storeApi)
          ? {
              baseUrl: options.storeApi.baseUrl,
              headers: options.storeApi.headers?.map(header => ({
                key: header.key,
                value: isIncludePasswords === true ? (header.value ?? '') : ''
              }))
            }
          : undefined,
        storeGoogleApi: isDefined(options.storeGoogleApi)
          ? {
              baseUrl: options.storeGoogleApi.baseUrl,
              headers: options.storeGoogleApi.headers?.map(header => ({
                key: header.key,
                value: isIncludePasswords === true ? (header.value ?? '') : ''
              })),
              googleAuthScopes: options.storeGoogleApi.googleAuthScopes,
              serviceAccountCredentials:
                isIncludePasswords === true
                  ? options.storeGoogleApi.serviceAccountCredentials
                  : undefined,
              googleCloudProject: options.storeGoogleApi.googleCloudProject,
              googleCloudClientEmail:
                options.storeGoogleApi.googleCloudClientEmail,
              googleAccessToken: options.storeGoogleApi.googleAccessToken
            }
          : undefined
      },
      serverTs: connection.serverTs
    };

    return apiProjectConnection;
  }

  tabToBaseConnection(item: {
    connection: ConnectionTab;
  }): BaseConnection {
    let { connection } = item;

    let connectionSt: ConnectionSt = {
      options: connection.options
    };
    let connectionLt: ConnectionLt = {};

    let apiBaseConnection: BaseConnection = {
      connectionId: connection.connectionId,
      projectId: connection.projectId,
      envId: connection.envId,
      type: connection.type,
      st: this.tabService.encrypt({ data: connectionSt }),
      lt: this.tabService.encrypt({ data: connectionLt })
    };

    return apiBaseConnection;
  }

  async checkConnectionDoesNotExist(item: {
    projectId: string;
    envId: string;
    connectionId: string;
  }) {
    let { projectId, envId, connectionId } = item;

    let connectionEnt = await this.db.drizzle.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.connectionId, connectionId),
        eq(connectionsTable.envId, envId),
        eq(connectionsTable.projectId, projectId)
      )
    });

    if (isDefined(connectionEnt)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_ALREADY_EXISTS
      });
    }
  }

  async getConnectionCheckExists(item: {
    connectionId: string;
    envId: string;
    projectId: string;
  }): Promise<ConnectionTab> {
    let { projectId, envId, connectionId } = item;

    let connection = await this.db.drizzle.query.connectionsTable
      .findFirst({
        where: and(
          eq(connectionsTable.connectionId, connectionId),
          eq(connectionsTable.envId, envId),
          eq(connectionsTable.projectId, projectId)
        )
      })
      .then(x => this.entToTab(x));

    if (isUndefined(connection)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }

    return connection;
  }
}
