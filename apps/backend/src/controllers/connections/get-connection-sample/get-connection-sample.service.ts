import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { ConnectionTab } from '#backend/drizzle/postgres/tables/connections';
import { connectionsTable } from '#backend/drizzle/postgres/tables/connections';
import { projectsTable } from '#backend/drizzle/postgres/tables/projects';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { fetchBigquerySample } from '#backend/functions/dwh/bigquery/fetch-bigquery-sample/fetch-bigquery-sample';
import { fetchDatabricksSample } from '#backend/functions/dwh/databricks/fetch-databricks-sample/fetch-databricks-sample';
import { fetchDuckdbSample } from '#backend/functions/dwh/duckdb/fetch-duckdb-sample/fetch-duckdb-sample';
import { fetchMysqlSample } from '#backend/functions/dwh/mysql/fetch-mysql-sample/fetch-mysql-sample';
import { fetchPgSample } from '#backend/functions/dwh/pg/fetch-pg-sample/fetch-pg-sample';
import { fetchPrestoSample } from '#backend/functions/dwh/presto/fetch-presto-sample/fetch-presto-sample';
import { fetchSnowflakeSample } from '#backend/functions/dwh/snowflake/fetch-snowflake-sample/fetch-snowflake-sample';
import { fetchTrinoSample } from '#backend/functions/dwh/trino/fetch-trino-sample/fetch-trino-sample';
import { DbService } from '#backend/services/db/db.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetConnectionSampleError } from '#common/types/backend/function-errors/get-connection-sample-error';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';
import type { ToBackendGetConnectionSampleOutput } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-output';

@Injectable()
export class GetConnectionSampleService {
  constructor(
    private db: DbService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger
  ) {}

  async getConnectionSample(item: {
    userId: string;
    projectId: string;
    envId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName?: string;
    offset?: number;
  }): Result.ResultAsync<
    ToBackendGetConnectionSampleOutput,
    GetConnectionSampleError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        isDefined(v.offset) && (!Number.isInteger(v.offset) || v.offset < 0)
          ? Result.fail({ code: 'BACKEND_WRONG_OFFSET' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.andThrough(v =>
        getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
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
      Result.bind('connection', v => {
        let connection: ConnectionTab = v.connections.find(
          connection => connection.connectionId === v.connectionId
        );

        return isUndefined(connection)
          ? Result.fail({ code: 'BACKEND_CONNECTION_DOES_NOT_EXIST' })
          : Result.succeed(connection);
      }),
      Result.andThrough(v =>
        (
          [
            'PostgreSQL',
            'MySQL',
            'SnowFlake',
            'BigQuery',
            'Databricks',
            'MotherDuck',
            'Presto',
            'Trino'
          ] satisfies ConnectionType[]
        ).findIndex(type => type === v.connection.type) < 0
          ? Result.fail({
              code: 'BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE'
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isUndefined(v.connection.rawSchema)
          ? Result.fail({ code: 'BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND' })
          : Result.succeed()
      ),
      Result.bind('schemaTable', v =>
        Result.succeed(
          v.connection.rawSchema.tables.find(
            table =>
              table.schemaName === v.schemaName &&
              table.tableName === v.tableName
          )
        )
      ),
      Result.andThrough(v =>
        v.connection.rawSchema.tables.findIndex(
          table => table.schemaName === v.schemaName
        ) < 0
          ? Result.fail({ code: 'BACKEND_WRONG_SCHEMA_NAME' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isUndefined(v.schemaTable)
          ? Result.fail({ code: 'BACKEND_WRONG_TABLE_NAME' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        isUndefined(v.columnName)
          ? Result.succeed()
          : v.schemaTable.columns.findIndex(
                column => column.columnName === v.columnName
              ) < 0
            ? Result.fail({ code: 'BACKEND_WRONG_COLUMN_NAME' })
            : Result.succeed()
      ),
      Result.bind('sampleResult', async v => {
        let sampleResult: FetchSampleResult;

        if (v.connection.type === 'PostgreSQL') {
          sampleResult = await fetchPgSample({
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        } else if (v.connection.type === 'MySQL') {
          sampleResult = await fetchMysqlSample({
            cs: this.cs,
            logger: this.logger,
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        } else if (v.connection.type === 'SnowFlake') {
          sampleResult = await fetchSnowflakeSample({
            cs: this.cs,
            logger: this.logger,
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        } else if (v.connection.type === 'Databricks') {
          sampleResult = await fetchDatabricksSample({
            cs: this.cs,
            logger: this.logger,
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        } else if (v.connection.type === 'BigQuery') {
          sampleResult = await fetchBigquerySample({
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        } else if (v.connection.type === 'MotherDuck') {
          sampleResult = await fetchDuckdbSample({
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        } else if (v.connection.type === 'Presto') {
          sampleResult = await fetchPrestoSample({
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        } else if (v.connection.type === 'Trino') {
          sampleResult = await fetchTrinoSample({
            connection: v.connection,
            schemaName: v.schemaName,
            tableName: v.tableName,
            columnName: v.columnName,
            offset: v.offset
          });
        }

        return Result.succeed(sampleResult);
      }),
      Result.map(
        (v): ToBackendGetConnectionSampleOutput => ({
          columnNames: v.sampleResult.columnNames,
          rows: v.sampleResult.rows,
          errorMessage: v.sampleResult.errorMessage
        })
      )
    );
  }
}
