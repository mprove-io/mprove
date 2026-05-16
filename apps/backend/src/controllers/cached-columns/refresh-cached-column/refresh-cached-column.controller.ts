import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray, or } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendRefreshCachedColumnRequestDto,
  ToBackendRefreshCachedColumnResponseDto
} from '#backend/controllers/cached-columns/refresh-cached-column/refresh-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  CachedColumnTab,
  CachedPartTab,
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { CachedColumnService } from '#backend/services/db/cached-column.service';
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
import { HashService } from '#backend/services/hash.service';
import { TabService } from '#backend/services/tab.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { ServerError } from '#common/models/server-error';
import type { ToBackendRefreshCachedColumnResponse } from '#common/zod/to-backend/connections/to-backend-refresh-cached-column';

const CACHED_PARTS_INSERT_CHUNK_SIZE = 400;

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RefreshCachedColumnController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private cachedColumnService: CachedColumnService,
    private projectsService: ProjectsService,
    private envsService: EnvsService,
    private membersService: MembersService,
    private tabService: TabService,
    private pgService: PgService,
    private mysqlService: MysqlService,
    private snowFlakeService: SnowFlakeService,
    private databricksService: DatabricksService,
    private bigQueryService: BigQueryService,
    private duckDbService: DuckDbService,
    private prestoService: PrestoService,
    private trinoService: TrinoService,
    private hashService: HashService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendRefreshCachedColumn)
  @ApiOperation({
    summary: 'RefreshCachedColumn',
    description: 'Refresh cached column'
  })
  @ApiOkResponse({ type: ToBackendRefreshCachedColumnResponseDto })
  async refreshCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRefreshCachedColumnRequestDto
  ): Promise<ToBackendRefreshCachedColumnResponse['payload']> {
    let {
      projectId,
      envId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      refreshType,
      sampleSize
    } = body.payload;

    await this.projectsService.getProjectCheckExists({ projectId: projectId });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
      projectId: projectId
    });

    await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: userMember
    });

    let cacheEnvId = await this.cachedColumnService.getCacheEnvId({
      projectId: projectId,
      envId: envId
    });

    if (cacheEnvId === PROJECT_ENV_PROD) {
      await this.membersService.getMemberCheckIsAdmin({
        memberId: user.userId,
        projectId: projectId
      });
    }

    let apiEnvs = await this.envsService.getApiEnvs({ projectId: projectId });
    let apiEnv = apiEnvs.find(x => x.envId === cacheEnvId);

    let connections: ConnectionTab[] =
      await this.db.drizzle.query.connectionsTable
        .findMany({
          where: and(
            eq(connectionsTable.projectId, projectId),
            or(
              eq(connectionsTable.envId, cacheEnvId),
              and(
                eq(connectionsTable.envId, PROJECT_ENV_PROD),
                inArray(
                  connectionsTable.connectionId,
                  apiEnv?.fallbackConnectionIds ?? []
                )
              )
            )
          )
        })
        .then(xs => xs.map(x => this.tabService.connectionEntToTab(x)));

    let connection = connections.find(c => c.connectionId === connectionId);

    if (isUndefined(connection)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_DOES_NOT_EXIST
      });
    }

    if (isUndefined(connection.rawSchema)) {
      throw new ServerError({
        message: ErEnum.BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND
      });
    }

    let schemaTable = connection.rawSchema.tables.find(
      t => t.schemaName === schemaName && t.tableName === tableName
    );

    let isSchemaFound = connection.rawSchema.tables.some(
      t => t.schemaName === schemaName
    );

    if (isSchemaFound === false) {
      throw new ServerError({ message: ErEnum.BACKEND_WRONG_SCHEMA_NAME });
    }

    if (isUndefined(schemaTable)) {
      throw new ServerError({ message: ErEnum.BACKEND_WRONG_TABLE_NAME });
    }

    let isColumnFound = schemaTable.columns.some(
      c => c.columnName === columnName
    );

    if (isColumnFound === false) {
      throw new ServerError({ message: ErEnum.BACKEND_WRONG_COLUMN_NAME });
    }

    let cacheLimit = this.cs.get<
      BackendConfig['dwhColumnUniqueValuesCacheLimit']
    >('dwhColumnUniqueValuesCacheLimit');

    let sourceSampleSize =
      refreshType === 'sample' ? (sampleSize ?? 10000) : undefined;

    let startedTs = makeTsNumber();

    let currentCachedColumn = await this.db.drizzle.query.cachedColumnsTable
      .findFirst({
        where: eq(
          cachedColumnsTable.cachedColumnFullId,
          this.hashService.makeCachedColumnFullId({
            projectId: projectId,
            connectionId: connectionId,
            envId: cacheEnvId,
            schemaName: schemaName,
            tableName: tableName,
            columnName: columnName
          })
        )
      })
      .then(x => this.tabService.cachedColumnEntToTab(x));

    let runningCachedColumn: CachedColumnTab;

    if (isUndefined(currentCachedColumn)) {
      runningCachedColumn = {
        cachedColumnFullId: this.hashService.makeCachedColumnFullId({
          projectId: projectId,
          connectionId: connectionId,
          envId: cacheEnvId,
          schemaName: schemaName,
          tableName: tableName,
          columnName: columnName
        }),
        projectId: projectId,
        connectionId: connectionId,
        envId: cacheEnvId,
        schemaNameLc: schemaName.toLowerCase(),
        tableNameLc: tableName.toLowerCase(),
        columnNameLc: columnName.toLowerCase(),
        requestedByUserId: user.userId,
        status: 'running',
        errorMessage: undefined,
        keyTag: undefined,
        startedTs: startedTs,
        completedTs: undefined,
        completedDurationMs: undefined,
        uniqueValuesCount: 0,
        limit: cacheLimit,
        sampleSize: undefined,
        isLimitReached: undefined,
        serverTs: undefined
      };

      await this.db.drizzle.transaction(
        async tx =>
          await this.db.packer.write({
            tx: tx,
            insertOrUpdate: {
              cachedColumns: [runningCachedColumn]
            }
          })
      );
    } else {
      runningCachedColumn = currentCachedColumn;
      runningCachedColumn.requestedByUserId = user.userId;
      runningCachedColumn.status = 'running';
      runningCachedColumn.errorMessage = undefined;
      runningCachedColumn.startedTs = startedTs;

      await this.db.drizzle.transaction(
        async tx =>
          await this.db.packer.write({
            tx: tx,
            update: {
              cachedColumns: [runningCachedColumn]
            }
          })
      );
    }

    this.finishRefreshCachedColumn({
      projectId: projectId,
      cacheEnvId: cacheEnvId,
      connectionId: connectionId,
      schemaName: schemaName,
      tableName: tableName,
      columnName: columnName,
      connection: connection,
      sampleSize: sourceSampleSize,
      cacheLimit: cacheLimit,
      startedTs: startedTs
    });

    let cachedColumn = this.cachedColumnService.cachedColumnTabToApi({
      cachedColumn: runningCachedColumn
    });

    return { cachedColumn: cachedColumn };
  }

  private async finishRefreshCachedColumn(item: {
    projectId: string;
    cacheEnvId: string;
    connectionId: string;
    schemaName: string;
    tableName: string;
    columnName: string;
    connection: ConnectionTab;
    sampleSize?: number;
    cacheLimit: number;
    startedTs: number;
  }) {
    let {
      projectId,
      cacheEnvId,
      connectionId,
      schemaName,
      tableName,
      columnName,
      connection,
      sampleSize,
      cacheLimit,
      startedTs
    } = item;

    try {
      let uniqueValuesResult = await this.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });

      await this.db.drizzle.transaction(async tx => {
        let currentCachedColumn = await this.db.drizzle.query.cachedColumnsTable
          .findFirst({
            where: eq(
              cachedColumnsTable.cachedColumnFullId,
              this.hashService.makeCachedColumnFullId({
                projectId: projectId,
                connectionId: connectionId,
                envId: cacheEnvId,
                schemaName: schemaName,
                tableName: tableName,
                columnName: columnName
              })
            )
          })
          .then(x => this.tabService.cachedColumnEntToTab(x));

        if (
          isUndefined(currentCachedColumn) ||
          currentCachedColumn?.startedTs !== startedTs
        ) {
          return;
        }

        let schemaNameLc = schemaName.toLowerCase();
        let tableNameLc = tableName.toLowerCase();
        let columnNameLc = columnName.toLowerCase();

        await tx
          .delete(cachedPartsTable)
          .where(
            and(
              eq(cachedPartsTable.projectId, projectId),
              eq(cachedPartsTable.connectionId, connectionId),
              eq(cachedPartsTable.envId, cacheEnvId),
              eq(cachedPartsTable.schemaNameLc, schemaNameLc),
              eq(cachedPartsTable.tableNameLc, tableNameLc),
              eq(cachedPartsTable.columnNameLc, columnNameLc)
            )
          );

        let uniqueValues = uniqueValuesResult.values;

        if (uniqueValues.length > 0) {
          let cachedParts: CachedPartTab[] = uniqueValues.map(row => ({
            cachedPartFullId: this.hashService.makeCachedPartFullId({
              projectId: projectId,
              connectionId: connectionId,
              envId: cacheEnvId,
              schemaName: schemaName,
              tableName: tableName,
              columnName: columnName,
              columnValue: row.columnValue ?? ''
            }),
            projectId: projectId,
            connectionId: connectionId,
            envId: cacheEnvId,
            schemaNameLc: schemaNameLc,
            tableNameLc: tableNameLc,
            columnNameLc: columnNameLc,
            columnValue: row.columnValue,
            columnValueLc: row.columnValue?.toLowerCase(),
            count: row.count,
            keyTag: undefined as string,
            serverTs: undefined as number
          }));

          for (
            let i = 0;
            i < cachedParts.length;
            i += CACHED_PARTS_INSERT_CHUNK_SIZE
          ) {
            let cachedPartsChunk = cachedParts.slice(
              i,
              i + CACHED_PARTS_INSERT_CHUNK_SIZE
            );

            await this.db.packer.write({
              tx: tx,
              insert: {
                cachedParts: cachedPartsChunk
              }
            });
          }
        }

        let completedTs = makeTsNumber();

        currentCachedColumn.status = 'completed';
        currentCachedColumn.errorMessage = undefined;
        currentCachedColumn.completedTs = completedTs;
        currentCachedColumn.completedDurationMs = completedTs - startedTs;
        currentCachedColumn.isLimitReached = uniqueValues.length >= cacheLimit;
        currentCachedColumn.uniqueValuesCount = uniqueValues.length;
        currentCachedColumn.sampleSize = sampleSize;

        await this.db.packer.write({
          tx: tx,
          update: {
            cachedColumns: [currentCachedColumn]
          }
        });
      });
    } catch (e) {
      await this.db.drizzle.transaction(async tx => {
        let currentCachedColumn = await this.db.drizzle.query.cachedColumnsTable
          .findFirst({
            where: eq(
              cachedColumnsTable.cachedColumnFullId,
              this.hashService.makeCachedColumnFullId({
                projectId: projectId,
                connectionId: connectionId,
                envId: cacheEnvId,
                schemaName: schemaName,
                tableName: tableName,
                columnName: columnName
              })
            )
          })
          .then(x => this.tabService.cachedColumnEntToTab(x));

        if (
          isUndefined(currentCachedColumn) ||
          currentCachedColumn?.startedTs !== startedTs
        ) {
          return;
        }

        currentCachedColumn.status = 'error';
        currentCachedColumn.errorMessage =
          e instanceof Error ? e.message : 'Failed to refresh cache';

        await this.db.packer.write({
          tx: tx,
          update: {
            cachedColumns: [currentCachedColumn]
          }
        });
      });
    }
  }

  private async fetchCachedParts(item: {
    connection: ConnectionTab;
    schemaName: string;
    tableName: string;
    columnName: string;
    sampleSize?: number;
    cacheLimit: number;
  }): Promise<CachedPartsResult> {
    let {
      connection,
      schemaName,
      tableName,
      columnName,
      sampleSize,
      cacheLimit
    } = item;

    if (connection.type === ConnectionTypeEnum.PostgreSQL) {
      return await this.pgService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === ConnectionTypeEnum.MySQL) {
      return await this.mysqlService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === ConnectionTypeEnum.SnowFlake) {
      return await this.snowFlakeService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === ConnectionTypeEnum.Databricks) {
      return await this.databricksService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === ConnectionTypeEnum.BigQuery) {
      return await this.bigQueryService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === ConnectionTypeEnum.MotherDuck) {
      return await this.duckDbService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === ConnectionTypeEnum.Presto) {
      return await this.prestoService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === ConnectionTypeEnum.Trino) {
      return await this.trinoService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    }

    throw new ServerError({
      message: ErEnum.BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE
    });
  }
}
