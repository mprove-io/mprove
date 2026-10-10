import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendRefreshCachedColumnRequestDto,
  ToBackendRefreshCachedColumnResponseDto
} from '#backend/controllers/cached-columns/refresh-cached-column/refresh-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  CachedColumnTab,
  CachedPartTab,
  ConnectionTab,
  MemberTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { CachedColumnService } from '#backend/services/db/cached-column/cached-column.service';
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
import { HashService } from '#backend/services/hash/hash.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendConnectionDoesNotExistError } from '#common/types/backend/errors/backend-connection-does-not-exist-error';
import type { BackendConnectionSchemaIsNotFoundError } from '#common/types/backend/errors/backend-connection-schema-is-not-found-error';
import type { BackendWrongColumnNameError } from '#common/types/backend/errors/backend-wrong-column-name-error';
import type { BackendWrongSchemaNameError } from '#common/types/backend/errors/backend-wrong-schema-name-error';
import type { BackendWrongTableNameError } from '#common/types/backend/errors/backend-wrong-table-name-error';
import type { CachedColumnEntToTabResultError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-result-error';
import type { ConnectionEntToTabResultError } from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetCacheEnvIdResultError } from '#common/types/backend/function-errors/get-cache-env-id-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { RawSchemaTable } from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRefreshCachedColumnOutput } from '#common/types/backend/routes/connections/refresh-cached-column/refresh-cached-column-output';

const CACHED_PARTS_INSERT_CHUNK_SIZE = 400;

type RefreshSettings = {
  cacheLimit: number;
  sourceSampleSize?: number;
  startedTs: number;
};

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

  @Post('api/ToBackendRefreshCachedColumn' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'RefreshCachedColumn',
    description: 'Refresh cached column'
  })
  @ApiOkResponse({ type: ToBackendRefreshCachedColumnResponseDto })
  async refreshCachedColumn(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendRefreshCachedColumnRequestDto
  ): Promise<BackendResultForOperation<'refreshCachedColumn'>> {
    return Result.pipe(
      Result.succeed({
        projectId: body.input.projectId,
        envId: body.input.envId,
        connectionId: body.input.connectionId,
        schemaName: body.input.schemaName,
        tableName: body.input.tableName,
        columnName: body.input.columnName,
        refreshType: body.input.refreshType,
        sampleSize: body.input.sampleSize,
        userId: user.userId
      }),
      Result.andThrough(v =>
        this.projectsService.getProjectCheckExistsResult({
          projectId: v.projectId
        })
      ),
      Result.bind(
        'userMember',
        (
          v
        ): Result.ResultAsync<
          MemberTab,
          GetMemberCheckIsEditorOrAdminResultError
        > =>
          this.membersService.getMemberCheckIsEditorOrAdminResult({
            memberId: v.userId,
            projectId: v.projectId
          })
      ),
      Result.andThrough(v =>
        this.envsService.getEnvCheckExistsAndAccessResult({
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind(
        'cacheEnvId',
        (v): Result.ResultAsync<string, GetCacheEnvIdResultError> =>
          this.cachedColumnService.getCacheEnvIdResult({
            projectId: v.projectId,
            envId: v.envId
          })
      ),
      Result.andThrough(v =>
        v.cacheEnvId === PROJECT_ENV_PROD
          ? this.membersService.getMemberCheckIsAdminResult({
              memberId: v.userId,
              projectId: v.projectId
            })
          : Result.succeed()
      ),
      Result.bind(
        'apiEnvs',
        (v): Result.ResultAsync<Env[], GetApiEnvsResultError> =>
          this.envsService.getApiEnvsResult({ projectId: v.projectId })
      ),
      Result.bind(
        'apiEnv',
        (v): Result.Result<Env, never> =>
          Result.succeed(
            v.apiEnvs.find(apiEnv => apiEnv.envId === v.cacheEnvId)
          )
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
                  eq(connectionsTable.envId, v.cacheEnvId),
                  and(
                    eq(connectionsTable.envId, PROJECT_ENV_PROD),
                    inArray(
                      connectionsTable.connectionId,
                      v.apiEnv?.fallbackConnectionIds ?? []
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
        isUndefined(v.connection.rawSchema)
          ? Result.fail({
              code: 'BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND'
            } satisfies BackendConnectionSchemaIsNotFoundError)
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
        v.connection.rawSchema.tables.some(
          table => table.schemaName === v.schemaName
        )
          ? Result.succeed()
          : Result.fail({
              code: 'BACKEND_WRONG_SCHEMA_NAME'
            } satisfies BackendWrongSchemaNameError)
      ),
      Result.andThrough(v =>
        isUndefined(v.schemaTable)
          ? Result.fail({
              code: 'BACKEND_WRONG_TABLE_NAME'
            } satisfies BackendWrongTableNameError)
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.schemaTable.columns.some(column => column.columnName === v.columnName)
          ? Result.succeed()
          : Result.fail({
              code: 'BACKEND_WRONG_COLUMN_NAME'
            } satisfies BackendWrongColumnNameError)
      ),
      Result.bind(
        'refreshSettings',
        (v): Result.Result<RefreshSettings, never> =>
          Result.succeed({
            cacheLimit: this.cs.get<
              BackendConfig['dwhColumnUniqueValuesCacheLimit']
            >('dwhColumnUniqueValuesCacheLimit'),
            sourceSampleSize:
              v.refreshType === 'sample' ? (v.sampleSize ?? 10000) : undefined,
            startedTs: makeTsNumber()
          })
      ),
      Result.bind(
        'currentCachedColumn',
        (
          v
        ): Result.ResultAsync<
          CachedColumnTab,
          CachedColumnEntToTabResultError
        > =>
          this.db.drizzle.query.cachedColumnsTable
            .findFirst({
              where: eq(
                cachedColumnsTable.cachedColumnFullId,
                this.hashService.makeCachedColumnFullId({
                  projectId: v.projectId,
                  connectionId: v.connectionId,
                  envId: v.cacheEnvId,
                  schemaName: v.schemaName,
                  tableName: v.tableName,
                  columnName: v.columnName
                })
              )
            })
            .then(cachedColumnEnt =>
              isUndefined(cachedColumnEnt)
                ? Result.succeed(undefined)
                : this.tabService.cachedColumnEntToTabResult({
                    cachedColumnEnt: cachedColumnEnt
                  })
            )
      ),
      Result.bind(
        'runningCachedColumn',
        (v): Result.Result<CachedColumnTab, never> => {
          if (isUndefined(v.currentCachedColumn)) {
            return Result.succeed({
              cachedColumnFullId: this.hashService.makeCachedColumnFullId({
                projectId: v.projectId,
                connectionId: v.connectionId,
                envId: v.cacheEnvId,
                schemaName: v.schemaName,
                tableName: v.tableName,
                columnName: v.columnName
              }),
              projectId: v.projectId,
              connectionId: v.connectionId,
              envId: v.cacheEnvId,
              schemaNameLc: v.schemaName.toLowerCase(),
              tableNameLc: v.tableName.toLowerCase(),
              columnNameLc: v.columnName.toLowerCase(),
              requestedByUserId: v.userId,
              status: 'running',
              errorMessage: undefined,
              keyTag: undefined,
              startedTs: v.refreshSettings.startedTs,
              completedTs: undefined,
              completedDurationMs: undefined,
              uniqueValuesCount: 0,
              limit: v.refreshSettings.cacheLimit,
              sampleSize: undefined,
              isLimitReached: undefined,
              serverTs: undefined
            });
          }

          v.currentCachedColumn.requestedByUserId = v.userId;
          v.currentCachedColumn.status = 'running';
          v.currentCachedColumn.errorMessage = undefined;
          v.currentCachedColumn.startedTs = v.refreshSettings.startedTs;

          return Result.succeed(v.currentCachedColumn);
        }
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            if (isUndefined(v.currentCachedColumn)) {
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    insertOrUpdate: { cachedColumns: [v.runningCachedColumn] }
                  })
              );
            } else {
              await this.db.drizzle.transaction(
                async tx =>
                  await this.db.packer.write({
                    tx: tx,
                    update: { cachedColumns: [v.runningCachedColumn] }
                  })
              );
            }
          }
        })
      ),
      Result.andThrough(v => {
        void this.finishRefreshCachedColumn({
          projectId: v.projectId,
          cacheEnvId: v.cacheEnvId,
          connectionId: v.connectionId,
          schemaName: v.schemaName,
          tableName: v.tableName,
          columnName: v.columnName,
          connection: v.connection,
          sampleSize: v.refreshSettings.sourceSampleSize,
          cacheLimit: v.refreshSettings.cacheLimit,
          startedTs: v.refreshSettings.startedTs
        });
        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendRefreshCachedColumnOutput => ({
          cachedColumn: this.cachedColumnService.cachedColumnTabToApi({
            cachedColumn: v.runningCachedColumn
          })
        })
      )
    );
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

    if (connection.type === 'PostgreSQL') {
      return await this.pgService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === 'MySQL') {
      return await this.mysqlService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === 'SnowFlake') {
      return await this.snowFlakeService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === 'Databricks') {
      return await this.databricksService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === 'BigQuery') {
      return await this.bigQueryService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === 'MotherDuck') {
      return await this.duckDbService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === 'Presto') {
      return await this.prestoService.fetchCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      });
    } else if (connection.type === 'Trino') {
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
      message: 'BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE'
    });
  }
}
