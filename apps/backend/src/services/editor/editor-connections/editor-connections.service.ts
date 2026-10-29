import type { ConnectionConfigEntry } from '@malloydata/malloy';
import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { makeBigqueryMalloyConfigPart } from '#backend/functions/dwh/bigquery/make-bigquery-malloy-config-part/make-bigquery-malloy-config-part';
import { makeDatabricksMalloyConfigPart } from '#backend/functions/dwh/databricks/make-databricks-malloy-config-part/make-databricks-malloy-config-part';
import { makeDuckdbMalloyConfigPart } from '#backend/functions/dwh/duckdb/make-duckdb-malloy-config-part/make-duckdb-malloy-config-part';
import { makeMysqlMalloyConfigPart } from '#backend/functions/dwh/mysql/make-mysql-malloy-config-part/make-mysql-malloy-config-part';
import { makePgMalloyConfigPart } from '#backend/functions/dwh/pg/make-pg-malloy-config-part/make-pg-malloy-config-part';
import { makePrestoMalloyConfigPart } from '#backend/functions/dwh/presto/make-presto-malloy-config-part/make-presto-malloy-config-part';
import { makeSnowflakeMalloyConfigPart } from '#backend/functions/dwh/snowflake/make-snowflake-malloy-config-part/make-snowflake-malloy-config-part';
import { makeTrinoMalloyConfigPart } from '#backend/functions/dwh/trino/make-trino-malloy-config-part/make-trino-malloy-config-part';
import { DbService } from '#backend/services/db/db.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { DbConnectionsFindManyError } from '#common/types/backend/function-errors/db/connections/db-connections-find-many-error';
import type { GetApiEnvsError } from '#common/types/backend/function-errors/get-api-envs-error';
import type { GetMalloySandboxEnvsAndFilesError } from '#common/types/backend/function-errors/get-malloy-sandbox-envs-and-files-error';
import type { Env } from '#common/types/backend/parts/env';
import type { MalloyConfigPart } from '#common/types/backend/parts/malloy-config-part';

export type GetMalloySandboxEnvsAndFilesOutput = {
  malloyConnectionEnvs: Record<string, string>;
  malloySandboxFiles: { path: string; data: string }[];
};

@Injectable()
export class EditorConnectionsService {
  constructor(private db: DbService) {}

  async getMalloySandboxEnvsAndFiles(item: {
    projectId: string;
    envId: string;
  }): Result.ResultAsync<
    GetMalloySandboxEnvsAndFilesOutput,
    GetMalloySandboxEnvsAndFilesError
  > {
    let { projectId, envId } = item;

    let malloyConnectionEnvs: Record<string, string> = {};

    let malloySandboxFiles: { path: string; data: string }[] = [];

    let envResult: Result.Result<Env[], GetApiEnvsError> = await getApiEnvs({
      db: this.db,
      projectId: projectId
    });

    if (Result.isFailure(envResult)) {
      return envResult;
    }

    let apiEnvs: Env[] = envResult.value;

    let apiEnv: Env = apiEnvs.find(env => env.envId === envId);

    let connections: ConnectionTab[] = [];

    if (isDefined(apiEnv)) {
      let connectionResult: Result.Result<
        ConnectionTab[],
        DbConnectionsFindManyError
      > = await this.db.connections.findMany({
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
      });

      if (Result.isFailure(connectionResult)) {
        return connectionResult;
      }

      connections = connectionResult.value;
    }

    let malloyConnectionConfigEntries: Record<string, ConnectionConfigEntry> =
      {};

    connections.forEach(connection => {
      let connectionIdUpperSnakeCase: string = connection.connectionId
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_');

      let prefix = `MPROVE_CONNECTION_${connectionIdUpperSnakeCase}`;

      malloyConnectionEnvs[`${prefix}_TYPE`] = connection.type;

      let config: MalloyConfigPart;

      switch (connection.type) {
        case 'PostgreSQL': {
          if (isDefined(connection.options.postgres)) {
            config = makePgMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case 'MySQL': {
          if (isDefined(connection.options.mysql)) {
            config = makeMysqlMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case 'BigQuery': {
          if (isDefined(connection.options.bigquery)) {
            config = makeBigqueryMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case 'SnowFlake': {
          if (isDefined(connection.options.snowflake)) {
            config = makeSnowflakeMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case 'MotherDuck': {
          if (isDefined(connection.options.motherduck)) {
            config = makeDuckdbMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case 'Databricks': {
          if (isDefined(connection.options.databricks)) {
            config = makeDatabricksMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case 'Trino': {
          if (isDefined(connection.options.trino)) {
            config = makeTrinoMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
        case 'Presto': {
          if (isDefined(connection.options.presto)) {
            config = makePrestoMalloyConfigPart({
              connection: connection,
              envPrefix: prefix
            });
          }
          break;
        }
      }

      if (isDefined(config)) {
        Object.assign(malloyConnectionEnvs, config.envs);

        malloyConnectionConfigEntries[connection.connectionId] =
          config.malloyConnectionConfigEntry;

        malloySandboxFiles.push(...config.files);
      }
    });

    malloySandboxFiles.push({
      path: '/home/user/.config/malloy/malloy-config.json',
      data: JSON.stringify(
        { connections: malloyConnectionConfigEntries },
        null,
        2
      )
    });

    return Result.succeed({
      malloyConnectionEnvs: malloyConnectionEnvs,
      malloySandboxFiles: malloySandboxFiles
    });
  }
}
