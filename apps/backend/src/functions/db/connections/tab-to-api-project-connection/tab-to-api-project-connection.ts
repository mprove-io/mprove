import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ProjectConnection } from '#common/types/backend/parts/project-connection';

export function tabToApiProjectConnection(item: {
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
            bigqueryQuerySizeLimitGb: options.bigquery.bigqueryQuerySizeLimitGb
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
              isIncludePasswords === true ? options.presto.password : undefined
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
