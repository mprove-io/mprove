import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray, or } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { BigQueryService } from '#backend/services/dwh/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql.service';
import { PgService } from '#backend/services/dwh/pg.service';
import { PrestoService } from '#backend/services/dwh/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino.service';
import { TabService } from '#backend/services/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { FetchSampleResult } from '#common/interfaces/to-backend/connections/fetch-sample-result';
import {
  ToBackendGetConnectionSampleRequest,
  ToBackendGetConnectionSampleResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-sample';
import { ServerError } from '#common/models/server-error';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSampleController {
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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSample)
  async getConnectionSample(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionSampleRequest = request.body;

    let {
      projectId,
      envId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      offset
    } = reqValid.payload;

    if (isDefined(offset) && (!Number.isInteger(offset) || offset < 0)) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_OFFSET
      });
    }

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
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
        message: ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }

    if (
      [
        ConnectionTypeEnum.PostgreSQL,
        ConnectionTypeEnum.MySQL,
        ConnectionTypeEnum.SnowFlake,
        ConnectionTypeEnum.BigQuery,
        ConnectionTypeEnum.Databricks,
        ConnectionTypeEnum.MotherDuck,
        ConnectionTypeEnum.Presto,
        ConnectionTypeEnum.Trino
      ].indexOf(connection.type) < 0
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE
      });
    }

    if (isUndefined(connection.schema)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND
      });
    }

    let schemaTable = connection.schema.tables.find(
      t => t.schemaName === schemaName && t.tableName === tableName
    );

    if (!connection.schema.tables.some(t => t.schemaName === schemaName)) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_SCHEMA_NAME
      });
    }

    if (!isDefined(schemaTable)) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_TABLE_NAME
      });
    }

    if (
      isDefined(columnName) &&
      !schemaTable.columns.some(c => c.columnName === columnName)
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_WRONG_COLUMN_NAME
      });
    }

    let sampleResult: FetchSampleResult;

    if (connection.type === ConnectionTypeEnum.PostgreSQL) {
      sampleResult = await this.pgService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === ConnectionTypeEnum.MySQL) {
      sampleResult = await this.mysqlService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === ConnectionTypeEnum.SnowFlake) {
      sampleResult = await this.snowFlakeService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === ConnectionTypeEnum.Databricks) {
      sampleResult = await this.databricksService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === ConnectionTypeEnum.BigQuery) {
      sampleResult = await this.bigQueryService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === ConnectionTypeEnum.MotherDuck) {
      sampleResult = await this.duckDbService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === ConnectionTypeEnum.Presto) {
      sampleResult = await this.prestoService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    } else if (connection.type === ConnectionTypeEnum.Trino) {
      sampleResult = await this.trinoService.fetchSample({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        offset: offset
      });
    }

    let payload: ToBackendGetConnectionSampleResponsePayload = {
      columnNames: sampleResult.columnNames,
      rows: sampleResult.rows,
      errorMessage: sampleResult.errorMessage
    };

    return payload;
  }
}
