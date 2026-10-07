import { Inject, Injectable } from '@nestjs/common';
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
import type { ConnectionType } from '#common/types/backend/parts/connection-parts/connection-type';
import type { FetchSampleResult } from '#common/types/backend/parts/connections/fetch-sample-result';

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
  }): Promise<{
    columnNames: string[];
    rows: string[][];
    errorMessage?: string;
  }> {
    let {
      userId,
      projectId,
      envId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      offset
    } = item;

    if (isDefined(offset) && (!Number.isInteger(offset) || offset < 0)) {
      throw new ServerError({
        message: 'BACKEND_WRONG_OFFSET'
      });
    }

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

    let connection = connections.find(c => c.connectionId === connectionId);

    if (!isDefined(connection)) {
      throw new ServerError({
        message: 'BACKEND_CONNECTION_DOES_NOT_EXIST'
      });
    }

    if (
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
      ).findIndex(candidate => candidate === connection.type) < 0
    ) {
      throw new ServerError({
        message: 'BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE'
      });
    }

    if (isUndefined(connection.rawSchema)) {
      throw new ServerError({
        message: 'BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND'
      });
    }

    let schemaTable = connection.rawSchema.tables.find(
      t => t.schemaName === schemaName && t.tableName === tableName
    );

    if (!connection.rawSchema.tables.some(t => t.schemaName === schemaName)) {
      throw new ServerError({
        message: 'BACKEND_WRONG_SCHEMA_NAME'
      });
    }

    if (!isDefined(schemaTable)) {
      throw new ServerError({
        message: 'BACKEND_WRONG_TABLE_NAME'
      });
    }

    if (
      isDefined(columnName) &&
      !schemaTable.columns.some(c => c.columnName === columnName)
    ) {
      throw new ServerError({
        message: 'BACKEND_WRONG_COLUMN_NAME'
      });
    }

    let sampleResult: FetchSampleResult;

    if (connection.type === 'PostgreSQL') {
      sampleResult = await this.pgService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === 'MySQL') {
      sampleResult = await this.mysqlService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === 'SnowFlake') {
      sampleResult = await this.snowFlakeService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === 'Databricks') {
      sampleResult = await this.databricksService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === 'BigQuery') {
      sampleResult = await this.bigQueryService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === 'MotherDuck') {
      sampleResult = await this.duckDbService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === 'Presto') {
      sampleResult = await this.prestoService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === 'Trino') {
      sampleResult = await this.trinoService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    }

    return {
      columnNames: sampleResult.columnNames,
      rows: sampleResult.rows,
      errorMessage: sampleResult.errorMessage
    };
  }
}
