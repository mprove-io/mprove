import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { BigQueryService } from '#backend/services/dwh/bigquery/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql/mysql.service';
import { PgService } from '#backend/services/dwh/pg/pg.service';
import { PrestoService } from '#backend/services/dwh/presto/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino/trino.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendConnectionDoesNotExistError } from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import type { ConnectionEntToTabResultError } from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetConnectionSampleResultError } from '#common/types/backend/function-errors/get-connection-sample-result-error';
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendGetConnectionSampleOutput } from '#common/types/backend/routes/connections/get-connection-sample/get-connection-sample-output';

@Injectable()
export class GetConnectionSampleService {
  constructor(
    private tabService: TabService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private pgService: PgService,
    private mysqlService: MysqlService,
    private snowFlakeService: SnowFlakeService,
    private databricksService: DatabricksService,
    private bigQueryService: BigQueryService,
    private duckDbService: DuckDbService,
    private prestoService: PrestoService,
    private trinoService: TrinoService,
    @Inject(DRIZZLE) private db: Db
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
  }): Promise<ToBackendGetConnectionSampleOutput> {
    let result: Result.Result<
      ToBackendGetConnectionSampleOutput,
      GetConnectionSampleResultError
    > = await this.getConnectionSampleResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let output: ToBackendGetConnectionSampleOutput = result.value;

    return output;
  }

  async getConnectionSampleResult(item: {
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
    GetConnectionSampleResultError
  > {
    return Result.pipe(
      Result.succeed(item),
      Result.andThrough(v =>
        isDefined(v.offset) && (!Number.isInteger(v.offset) || v.offset < 0)
          ? Result.fail({ code: 'BACKEND_WRONG_OFFSET' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.andThrough(v =>
        this.membersService.getMemberCheckIsEditorOrAdminResult({
          memberId: v.userId,
          projectId: v.projectId
        })
      ),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsResultError> =>
          this.envsService.getApiEnvsResult({ projectId: v.projectId })
      ),
      Result.bind(
        'apiEnv',
        (v): Result.Result<Env, never> =>
          Result.succeed(v.apiEnvs.find(apiEnv => apiEnv.envId === v.envId))
      ),
      Result.bind(
        'connections',
        (
          v
        ): Result.ResultAsync<ConnectionTab[], ConnectionEntToTabResultError> =>
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
            .then(connectionEnts =>
              Result.sequence(connectionEnts, connectionEnt =>
                this.tabService.connectionEntToTabResult({
                  connectionEnt: connectionEnt
                })
              )
            )
      ),
      Result.bind(
        'connection',
        (
          v
        ): Result.Result<ConnectionTab, BackendConnectionDoesNotExistError> => {
          let connection: ConnectionTab = v.connections.find(
            connection => connection.connectionId === v.connectionId
          );

          return isUndefined(connection)
            ? Result.fail({ code: 'BACKEND_CONNECTION_DOES_NOT_EXIST' })
            : Result.succeed(connection);
        }
      ),
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
      Result.bind(
        'schemaTable',
        (v): Result.Result<RawSchemaTable, never> =>
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
      Result.bind(
        'sampleResult',
        async (v): Result.ResultAsync<FetchSampleResult, never> => {
          let sampleResult: FetchSampleResult;

          if (v.connection.type === 'PostgreSQL') {
            sampleResult = await this.pgService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          } else if (v.connection.type === 'MySQL') {
            sampleResult = await this.mysqlService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          } else if (v.connection.type === 'SnowFlake') {
            sampleResult = await this.snowFlakeService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          } else if (v.connection.type === 'Databricks') {
            sampleResult = await this.databricksService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          } else if (v.connection.type === 'BigQuery') {
            sampleResult = await this.bigQueryService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          } else if (v.connection.type === 'MotherDuck') {
            sampleResult = await this.duckDbService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          } else if (v.connection.type === 'Presto') {
            sampleResult = await this.prestoService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          } else if (v.connection.type === 'Trino') {
            sampleResult = await this.trinoService.fetchSample({
              connection: v.connection,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName,
              offset: v.offset
            });
          }

          return Result.succeed(sampleResult);
        }
      ),
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
