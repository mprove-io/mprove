import { Body, Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  type ToBackendRefreshCachedColumnRequestDto,
  ToBackendRefreshCachedColumnResponseDto
} from '#backend/controllers/cached-columns/refresh-cached-column/refresh-cached-column.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type {
  CachedColumnTab,
  CachedPartTab,
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { cachedPartsTable } from '#backend/drizzle/postgres/schema/cached-parts';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { cachedColumnTabToApi } from '#backend/functions/db/cached-column/cached-column-tab-to-api/cached-column-tab-to-api';
import { getCacheEnvId } from '#backend/functions/db/cached-column/get-cache-env-id/get-cache-env-id';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getEnvCheckExistsAndAccess } from '#backend/functions/db/envs/get-env-check-exists-and-access/get-env-check-exists-and-access';
import { getMemberCheckIsAdmin } from '#backend/functions/db/members/get-member-check-is-admin/get-member-check-is-admin';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { fetchBigqueryCachedParts } from '#backend/functions/dwh/bigquery/fetch-bigquery-cached-parts/fetch-bigquery-cached-parts';
import { fetchDatabricksCachedParts } from '#backend/functions/dwh/databricks/fetch-databricks-cached-parts/fetch-databricks-cached-parts';
import { fetchDuckdbCachedParts } from '#backend/functions/dwh/duckdb/fetch-duckdb-cached-parts/fetch-duckdb-cached-parts';
import { fetchMysqlCachedParts } from '#backend/functions/dwh/mysql/fetch-mysql-cached-parts/fetch-mysql-cached-parts';
import { fetchPgCachedParts } from '#backend/functions/dwh/pg/fetch-pg-cached-parts/fetch-pg-cached-parts';
import { fetchPrestoCachedParts } from '#backend/functions/dwh/presto/fetch-presto-cached-parts/fetch-presto-cached-parts';
import { fetchSnowflakeCachedParts } from '#backend/functions/dwh/snowflake/fetch-snowflake-cached-parts/fetch-snowflake-cached-parts';
import { fetchTrinoCachedParts } from '#backend/functions/dwh/trino/fetch-trino-cached-parts/fetch-trino-cached-parts';
import { makeCachedColumnFullId } from '#backend/functions/hash/make-cached-column-full-id/make-cached-column-full-id';
import { makeCachedPartFullId } from '#backend/functions/hash/make-cached-part-full-id/make-cached-part-full-id';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import type { CachedPartsResult } from '#backend/interfaces/cached-parts-result';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { BackendConnectionSchemaIsNotFoundError } from '#common/types/backend/errors/backend-connection-schema-is-not-found-error';
import type { BackendWrongColumnNameError } from '#common/types/backend/errors/backend-wrong-column-name-error';
import type { BackendWrongSchemaNameError } from '#common/types/backend/errors/backend-wrong-schema-name-error';
import type { BackendWrongTableNameError } from '#common/types/backend/errors/backend-wrong-table-name-error';
import type { CompleteRefreshCachedColumnError } from '#common/types/backend/function-errors/complete-refresh-cached-column-error';
import type { FetchCachedPartsError } from '#common/types/backend/function-errors/fetch-cached-parts-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendRefreshCachedColumnOutput } from '#common/types/backend/routes/connections/refresh-cached-column/refresh-cached-column-output';

type PrepareRefreshPayload = {
  cacheLimit: number;
  sourceSampleSize?: number;
  startedTs: number;
};

const CACHED_PARTS_INSERT_CHUNK_SIZE = 400;

@ApiTags('CachedColumns')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class RefreshCachedColumnController {
  constructor(
    private cs: ConfigService<BackendConfig>,
    private db: DbService,
    private logger: Logger
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
        this.db.projects.findFirstCheckExists({
          where: eq(projectsTable.projectId, v.projectId)
        })
      ),
      Result.bind('userMember', v =>
        getMemberCheckIsEditorOrAdmin({
          memberId: v.userId,
          projectId: v.projectId,
          db: this.db
        })
      ),
      Result.andThrough(v =>
        getEnvCheckExistsAndAccess({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId,
          member: v.userMember
        })
      ),
      Result.bind('cacheEnvId', v =>
        getCacheEnvId({
          db: this.db,
          projectId: v.projectId,
          envId: v.envId
        })
      ),
      Result.andThrough(v =>
        v.cacheEnvId === PROJECT_ENV_PROD
          ? getMemberCheckIsAdmin({
              memberId: v.userId,
              projectId: v.projectId,
              db: this.db
            })
          : Result.succeed()
      ),
      Result.bind('apiEnvs', v =>
        getApiEnvs({ db: this.db, projectId: v.projectId })
      ),
      Result.bind('apiEnv', v =>
        Result.succeed(v.apiEnvs.find(apiEnv => apiEnv.envId === v.cacheEnvId))
      ),
      Result.bind('connections', v =>
        this.db.connections.findMany({
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
        isUndefined(v.connection.rawSchema)
          ? Result.fail({
              code: 'BACKEND_CONNECTION_SCHEMA_IS_NOT_FOUND'
            } satisfies BackendConnectionSchemaIsNotFoundError)
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
      Result.bind('prepareRefreshPayload', v => {
        let prepareRefreshPayload: PrepareRefreshPayload = {
          cacheLimit: this.cs.get<
            BackendConfig['dwhColumnUniqueValuesCacheLimit']
          >('dwhColumnUniqueValuesCacheLimit'),
          sourceSampleSize:
            v.refreshType === 'sample' ? (v.sampleSize ?? 10000) : undefined,
          startedTs: makeTsNumber()
        };

        return Result.succeed(prepareRefreshPayload);
      }),
      Result.bind('currentCachedColumn', v =>
        this.db.cachedColumns.findFirst({
          where: eq(
            cachedColumnsTable.cachedColumnFullId,
            makeCachedColumnFullId({
              projectId: v.projectId,
              connectionId: v.connectionId,
              envId: v.cacheEnvId,
              schemaName: v.schemaName,
              tableName: v.tableName,
              columnName: v.columnName
            })
          )
        })
      ),
      Result.bind('runningCachedColumn', v => {
        if (isUndefined(v.currentCachedColumn)) {
          let runningCachedColumn: CachedColumnTab = {
            cachedColumnFullId: makeCachedColumnFullId({
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
            startedTs: v.prepareRefreshPayload.startedTs,
            completedTs: undefined,
            completedDurationMs: undefined,
            uniqueValuesCount: 0,
            limit: v.prepareRefreshPayload.cacheLimit,
            sampleSize: undefined,
            isLimitReached: undefined,
            serverTs: undefined
          };

          return Result.succeed(runningCachedColumn);
        }

        v.currentCachedColumn.requestedByUserId = v.userId;
        v.currentCachedColumn.status = 'running';
        v.currentCachedColumn.errorMessage = undefined;
        v.currentCachedColumn.startedTs = v.prepareRefreshPayload.startedTs;

        return Result.succeed(v.currentCachedColumn);
      }),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            if (isUndefined(v.currentCachedColumn)) {
              await this.db.writeUnwrap({
                insertOrUpdate: { cachedColumns: [v.runningCachedColumn] }
              });
            } else {
              await this.db.writeUnwrap({
                update: { cachedColumns: [v.runningCachedColumn] }
              });
            }
          }
        })
      ),
      Result.andThrough(v => {
        void this.finishRefreshCachedColumnUnwrap({
          projectId: v.projectId,
          cacheEnvId: v.cacheEnvId,
          connectionId: v.connectionId,
          schemaName: v.schemaName,
          tableName: v.tableName,
          columnName: v.columnName,
          connection: v.connection,
          sampleSize: v.prepareRefreshPayload.sourceSampleSize,
          cacheLimit: v.prepareRefreshPayload.cacheLimit,
          startedTs: v.prepareRefreshPayload.startedTs
        });
        return Result.succeed();
      }),
      Result.map(
        (v): ToBackendRefreshCachedColumnOutput => ({
          cachedColumn: cachedColumnTabToApi({
            cachedColumn: v.runningCachedColumn
          })
        })
      )
    );
  }

  private async finishRefreshCachedColumnUnwrap(item: {
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
  }): Promise<void> {
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

    let refreshErrorMessage: string;

    try {
      let completeRefreshCachedColumnOutput: Result.Result<
        void,
        CompleteRefreshCachedColumnError
      > = await this.completeRefreshCachedColumn({
        projectId: projectId,
        cacheEnvId: cacheEnvId,
        connectionId: connectionId,
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit,
        startedTs: startedTs
      });

      if (Result.isSuccess(completeRefreshCachedColumnOutput)) {
        return;
      }

      refreshErrorMessage = completeRefreshCachedColumnOutput.error.code;
    } catch (e) {
      refreshErrorMessage =
        e instanceof Error ? e.message : 'Failed to refresh cache';
    }

    await this.db.drizzle.transaction(async tx => {
      let currentCachedColumn: CachedColumnTab =
        await this.db.cachedColumns.findFirstUnwrap({
          where: eq(
            cachedColumnsTable.cachedColumnFullId,
            makeCachedColumnFullId({
              projectId: projectId,
              connectionId: connectionId,
              envId: cacheEnvId,
              schemaName: schemaName,
              tableName: tableName,
              columnName: columnName
            })
          )
        });

      if (
        isUndefined(currentCachedColumn) ||
        currentCachedColumn?.startedTs !== startedTs
      ) {
        return;
      }

      currentCachedColumn.status = 'error';

      currentCachedColumn.errorMessage = refreshErrorMessage;

      await this.db.txWriteUnwrap({
        tx: tx,
        update: {
          cachedColumns: [currentCachedColumn]
        }
      });
    });
  }

  private async completeRefreshCachedColumn(item: {
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
  }): Result.ResultAsync<void, CompleteRefreshCachedColumnError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('cachedPartOutput', v =>
        this.fetchCachedParts({
          connection: v.connection,
          schemaName: v.schemaName,
          tableName: v.tableName,
          columnName: v.columnName,
          sampleSize: v.sampleSize,
          cacheLimit: v.cacheLimit
        })
      ),
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await this.db.drizzle.transaction(async tx => {
              // Reject conversion/write failures so the complete transaction rolls back.
              let currentCachedColumn: CachedColumnTab =
                await this.db.cachedColumns.findFirstUnwrap({
                  where: eq(
                    cachedColumnsTable.cachedColumnFullId,
                    makeCachedColumnFullId({
                      projectId: v.projectId,
                      connectionId: v.connectionId,
                      envId: v.cacheEnvId,
                      schemaName: v.schemaName,
                      tableName: v.tableName,
                      columnName: v.columnName
                    })
                  )
                });

              if (
                isUndefined(currentCachedColumn) ||
                currentCachedColumn?.startedTs !== v.startedTs
              ) {
                return;
              }

              let schemaNameLc: string = v.schemaName.toLowerCase();

              let tableNameLc: string = v.tableName.toLowerCase();

              let columnNameLc: string = v.columnName.toLowerCase();

              await tx
                .delete(cachedPartsTable)
                .where(
                  and(
                    eq(cachedPartsTable.projectId, v.projectId),
                    eq(cachedPartsTable.connectionId, v.connectionId),
                    eq(cachedPartsTable.envId, v.cacheEnvId),
                    eq(cachedPartsTable.schemaNameLc, schemaNameLc),
                    eq(cachedPartsTable.tableNameLc, tableNameLc),
                    eq(cachedPartsTable.columnNameLc, columnNameLc)
                  )
                );

              let uniqueValues = v.cachedPartOutput.values;

              if (uniqueValues.length > 0) {
                let cachedParts: CachedPartTab[] = uniqueValues.map(row => ({
                  cachedPartFullId: makeCachedPartFullId({
                    projectId: v.projectId,
                    connectionId: v.connectionId,
                    envId: v.cacheEnvId,
                    schemaName: v.schemaName,
                    tableName: v.tableName,
                    columnName: v.columnName,
                    columnValue: row.columnValue ?? ''
                  }),
                  projectId: v.projectId,
                  connectionId: v.connectionId,
                  envId: v.cacheEnvId,
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
                  let cachedPartsChunk: CachedPartTab[] = cachedParts.slice(
                    i,
                    i + CACHED_PARTS_INSERT_CHUNK_SIZE
                  );

                  await this.db.txWriteUnwrap({
                    tx: tx,
                    insert: {
                      cachedParts: cachedPartsChunk
                    }
                  });
                }
              }

              let completedTs: number = makeTsNumber();

              currentCachedColumn.status = 'completed';

              currentCachedColumn.errorMessage = undefined;

              currentCachedColumn.completedTs = completedTs;

              currentCachedColumn.completedDurationMs =
                completedTs - v.startedTs;

              currentCachedColumn.isLimitReached =
                uniqueValues.length >= v.cacheLimit;

              currentCachedColumn.uniqueValuesCount = uniqueValues.length;

              currentCachedColumn.sampleSize = v.sampleSize;

              await this.db.txWriteUnwrap({
                tx: tx,
                update: {
                  cachedColumns: [currentCachedColumn]
                }
              });
            });
          }
        })
      ),
      Result.map((v): void => undefined)
    );
  }

  private async fetchCachedParts(item: {
    connection: ConnectionTab;
    schemaName: string;
    tableName: string;
    columnName: string;
    sampleSize?: number;
    cacheLimit: number;
  }): Result.ResultAsync<CachedPartsResult, FetchCachedPartsError> {
    let {
      connection,
      schemaName,
      tableName,
      columnName,
      sampleSize,
      cacheLimit
    } = item;

    if (connection.type === 'PostgreSQL') {
      return fetchPgCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    } else if (connection.type === 'MySQL') {
      return fetchMysqlCachedParts({
        cs: this.cs,
        logger: this.logger,
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    } else if (connection.type === 'SnowFlake') {
      return fetchSnowflakeCachedParts({
        cs: this.cs,
        logger: this.logger,
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    } else if (connection.type === 'Databricks') {
      return fetchDatabricksCachedParts({
        cs: this.cs,
        logger: this.logger,
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    } else if (connection.type === 'BigQuery') {
      return fetchBigqueryCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    } else if (connection.type === 'MotherDuck') {
      return fetchDuckdbCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    } else if (connection.type === 'Presto') {
      return fetchPrestoCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    } else if (connection.type === 'Trino') {
      return fetchTrinoCachedParts({
        connection: connection,
        schemaName: schemaName,
        tableName: tableName,
        columnName: columnName,
        sampleSize: sampleSize,
        cacheLimit: cacheLimit
      }).then(output => Result.succeed(output));
    }

    return Result.fail({
      code: 'BACKEND_CONNECTION_TYPE_IS_NOT_SUPPORTED_FOR_SAMPLE'
    });
  }
}
