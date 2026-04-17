import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { DEFAULT_QUERY_SIZE_LIMIT } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { BaseConnection } from '#common/zod/backend/base-connection';
import type { ConnectionOptions } from '#common/zod/backend/connection-parts/connection-options';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { ConnectionLt, ConnectionSt } from '#common/zod/st-lt';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';
import { TabToEntService } from '../tab-to-ent.service';

@Injectable()
export class ConnectionsService {
  constructor(
    private hashService: HashService,
    private tabService: TabService,
    private tabToEntService: TabToEntService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  cleanInternalFields(item: { options: ConnectionOptions }) {
    let { options } = item;

    if (isDefined(options.postgres)) {
      let hostSet =
        isDefined(options.postgres.internalHost) &&
        options.postgres.internalHost !== '';

      let portSet =
        isDefined(options.postgres.internalPort) &&
        options.postgres.internalPort !== 0;

      if (!hostSet || !portSet) {
        options.postgres.internalHost = undefined;
        options.postgres.internalPort = undefined;
      }
    }

    if (isDefined(options.mysql)) {
      let hostSet =
        isDefined(options.mysql.internalHost) &&
        options.mysql.internalHost !== '';

      let portSet =
        isDefined(options.mysql.internalPort) &&
        options.mysql.internalPort !== 0;

      if (!hostSet || !portSet) {
        options.mysql.internalHost = undefined;
        options.mysql.internalPort = undefined;
      }
    }

    if (isDefined(options.presto)) {
      let serverSet =
        isDefined(options.presto.internalServer) &&
        options.presto.internalServer !== '';

      let portSet =
        isDefined(options.presto.internalPort) &&
        options.presto.internalPort !== 0;

      if (!serverSet || !portSet) {
        options.presto.internalServer = undefined;
        options.presto.internalPort = undefined;
      }
    }

    if (isDefined(options.trino)) {
      let serverSet =
        isDefined(options.trino.internalServer) &&
        options.trino.internalServer !== '';

      if (!serverSet) {
        options.trino.internalServer = undefined;
      }
    }

    if (isDefined(options.databricks)) {
      let hostSet =
        isDefined(options.databricks.internalHost) &&
        options.databricks.internalHost !== '';

      if (!hostSet) {
        options.databricks.internalHost = undefined;
      }
    }
  }

  makeConnection(item: {
    projectId: string;
    connectionId: string;
    envId: string;
    type: ConnectionTypeEnum;
    options: ConnectionOptions;
  }): ConnectionTab {
    let { projectId, connectionId, envId, type, options } = item;

    this.cleanInternalFields({ options: options });

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
      keyTag: undefined,
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

    // rawSchema is intentionally not included here — it is only needed
    // by blockml for pre-populating Malloy's schema cache.
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
        // clickhouse: isDefined(options.clickhouse)
        //   ? {
        //       host: options.clickhouse.host,
        //       port: options.clickhouse.port,
        //       username: options.clickhouse.username,
        //       password:
        //         isIncludePasswords === true
        //           ? options.clickhouse.password
        //           : undefined,
        //       isSSL: options.clickhouse.isSSL
        //     }
        //   : undefined,
        databricks: isDefined(options.databricks)
          ? {
              authType: options.databricks.authType,
              host: options.databricks.host,
              internalHost: options.databricks.internalHost,
              path: options.databricks.path,
              token:
                isIncludePasswords === true
                  ? options.databricks.token
                  : undefined,
              oauthClientId: options.databricks.oauthClientId,
              oauthClientSecret:
                isIncludePasswords === true
                  ? options.databricks.oauthClientSecret
                  : undefined,
              defaultCatalog: options.databricks.defaultCatalog,
              defaultSchema: options.databricks.defaultSchema
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
              internalHost: options.postgres.internalHost,
              port: options.postgres.port,
              internalPort: options.postgres.internalPort,
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
              internalHost: options.mysql.internalHost,
              port: options.mysql.port,
              internalPort: options.mysql.internalPort,
              database: options.mysql.database,
              user: options.mysql.user,
              password:
                isIncludePasswords === true ? options.mysql.password : undefined
            }
          : undefined,
        trino: isDefined(options.trino)
          ? {
              server: options.trino.server,
              internalServer: options.trino.internalServer,
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
              internalServer: options.presto.internalServer,
              port: options.presto.port,
              internalPort: options.presto.internalPort,
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
              googleAccessToken:
                isIncludePasswords === true
                  ? options.storeGoogleApi.googleAccessToken
                  : undefined,
              googleAccessTokenExpiryDate:
                isIncludePasswords === true
                  ? options.storeGoogleApi.googleAccessTokenExpiryDate
                  : undefined
            }
          : undefined
      },
      serverTs: connection.serverTs
    };

    return apiProjectConnection;
  }

  tabToBaseConnection(item: { connection: ConnectionTab }): BaseConnection {
    let { connection } = item;

    let connectionSt: ConnectionSt = {
      options: connection.options
    };

    let connectionLt: ConnectionLt = { rawSchema: connection.rawSchema };

    let apiBaseConnection: BaseConnection = {
      connectionId: connection.connectionId,
      projectId: connection.projectId,
      envId: connection.envId,
      type: connection.type,
      st: this.tabToEntService.encrypt({ data: connectionSt }),
      lt: this.tabToEntService.encrypt({ data: connectionLt })
    };

    return apiBaseConnection;
  }

  async checkConnectionDoesNotExist(item: {
    projectId: string;
    envId: string;
    connectionId: string;
  }) {
    let { projectId, envId, connectionId } = item;

    let connection = await this.db.drizzle.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.connectionId, connectionId),
        eq(connectionsTable.envId, envId),
        eq(connectionsTable.projectId, projectId)
      )
    });

    if (isDefined(connection)) {
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
      .then(x => this.tabService.connectionEntToTab(x));

    if (isUndefined(connection)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }

    return connection;
  }
}
