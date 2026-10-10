import { Inject, Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import pIteration from 'p-iteration';
import { sortSchemaColumns } from '#backend/controllers/connections/get-connection-schemas/sort-schema-columns/sort-schema-columns';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  BridgeTab,
  CachedColumnTab,
  ConnectionTab,
  MemberTab,
  StructTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { BridgesService } from '#backend/services/db/bridges/bridges.service';
import { CachedColumnService } from '#backend/services/db/cached-column/cached-column.service';
import { EnvsService } from '#backend/services/db/envs/envs.service';
import { MembersService } from '#backend/services/db/members/members.service';
import { ProjectsService } from '#backend/services/db/projects/projects.service';
import { StructsService } from '#backend/services/db/structs/structs.service';
import { BigQueryService } from '#backend/services/dwh/bigquery/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql/mysql.service';
import { PgService } from '#backend/services/dwh/pg/pg.service';
import { PrestoService } from '#backend/services/dwh/presto/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino/trino.service';
import { TabService } from '#backend/services/tab/tab.service';
import { TabToEntService } from '#backend/services/tab-to-ent/tab-to-ent.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { CachedColumnEntToTabResultError } from '#common/types/backend/function-errors/cached-column-ent-to-tab-result-error';
import type { ConnectionEntToTabResultError } from '#common/types/backend/function-errors/connection-ent-to-tab-result-error';
import type { GetApiEnvsResultError } from '#common/types/backend/function-errors/get-api-envs-result-error';
import type { GetBridgeCheckExistsResultError } from '#common/types/backend/function-errors/get-bridge-check-exists-result-error';
import type { GetConnectionSchemasResultError } from '#common/types/backend/function-errors/get-connection-schemas-result-error';
import type { GetMemberCheckIsEditorOrAdminResultError } from '#common/types/backend/function-errors/get-member-check-is-editor-or-admin-result-error';
import type { GetStructCheckExistsResultError } from '#common/types/backend/function-errors/get-struct-check-exists-result-error';
import type { ColumnCombinedReference } from '#common/types/backend/parts/connection-schemas/combined-schemas/column-combined-reference';
import type { CombinedSchema } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema';
import type { CombinedSchemaColumn } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-column';
import type { CombinedSchemaItem } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-item';
import type { CombinedSchemaTable } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-table';
import type { ExtraSchema } from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { CachedColumn } from '#common/types/backend/parts/connections/cached-column';
import type { Env } from '#common/types/backend/parts/env';
import type { ToBackendGetConnectionSchemasOutput } from '#common/types/backend/routes/connections/get-connection-schemas/get-connection-schemas-output';
import type { RelationshipType } from '#common/types/shared/schema/relationship-type';
import type { ConnectionLt } from '#common/types/shared/st-lt/connections/connection-lt';
import type { ConnectionSt } from '#common/types/shared/st-lt/connections/connection-st';

type ConnectionRawSchemaItem = {
  connectionId: string;
  schema: ConnectionRawSchema;
};

const { forEachSeries } = pIteration;

@Injectable()
export class GetConnectionSchemasService {
  constructor(
    private tabService: TabService,
    private cachedColumnService: CachedColumnService,
    private tabToEntService: TabToEntService,
    private projectsService: ProjectsService,
    private bridgesService: BridgesService,
    private structsService: StructsService,
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

  async getConnectionSchemas(item: {
    userId: string;
    projectId: string;
    envId: string;
    repoId: string;
    branchId: string;
    isRefreshExistingCache: boolean;
  }): Promise<ToBackendGetConnectionSchemasOutput> {
    let result: Result.Result<
      ToBackendGetConnectionSchemasOutput,
      GetConnectionSchemasResultError
    > = await this.getConnectionSchemasResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let output: ToBackendGetConnectionSchemasOutput = result.value;

    return output;
  }

  async getConnectionSchemasResult(item: {
    userId: string;
    projectId: string;
    envId: string;
    repoId: string;
    branchId: string;
    isRefreshExistingCache: boolean;
  }): Result.ResultAsync<
    ToBackendGetConnectionSchemasOutput,
    GetConnectionSchemasResultError
  > {
    return Result.pipe(
      Result.succeed(item),
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
      Result.bind(
        'bridge',
        (v): Result.ResultAsync<BridgeTab, GetBridgeCheckExistsResultError> =>
          this.bridgesService.getBridgeCheckExistsResult({
            projectId: v.projectId,
            repoId: v.repoId,
            branchId: v.branchId,
            envId: v.envId
          })
      ),
      Result.bind(
        'struct',
        (v): Result.ResultAsync<StructTab, GetStructCheckExistsResultError> =>
          this.structsService.getStructCheckExistsResult({
            structId: v.bridge.structId,
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
        'eligibleConnections',
        (v): Result.Result<ConnectionTab[], never> =>
          Result.succeed(
            v.connections.filter(
              c =>
                c.type !== 'GoogleApi' &&
                c.type !== 'Api' &&
                (c.type === 'PostgreSQL' ||
                  c.type === 'MySQL' ||
                  c.type === 'SnowFlake' ||
                  c.type === 'Databricks' ||
                  c.type === 'BigQuery' ||
                  c.type === 'MotherDuck' ||
                  c.type === 'Presto' ||
                  c.type === 'Trino')
            )
          )
      ),
      Result.bind(
        'connectionRawSchemaItems',
        async (v): Result.ResultAsync<ConnectionRawSchemaItem[], never> => {
          let connectionRawSchemaItems: ConnectionRawSchemaItem[] = [];

          if (v.isRefreshExistingCache === true) {
            let fetched: ConnectionRawSchemaItem[] =
              await this.fetchAndSaveSchemas({
                connections: v.eligibleConnections
              });

            fetched.forEach(x => {
              connectionRawSchemaItems.push(x);
            });
          } else {
            let connectionsWithCache: ConnectionTab[] =
              v.eligibleConnections.filter(x => isDefined(x.rawSchema));

            connectionsWithCache.forEach(x => {
              connectionRawSchemaItems.push({
                connectionId: x.connectionId,
                schema: x.rawSchema
              });
            });

            let connectionsWithoutCache: ConnectionTab[] =
              v.eligibleConnections.filter(x => isUndefined(x.rawSchema));

            if (connectionsWithoutCache.length > 0) {
              let fetched: ConnectionRawSchemaItem[] =
                await this.fetchAndSaveSchemas({
                  connections: connectionsWithoutCache
                });

              fetched.forEach(x => {
                connectionRawSchemaItems.push(x);
              });
            }
          }

          return Result.succeed(connectionRawSchemaItems);
        }
      ),
      Result.bind(
        'cacheEnvId',
        (v): Result.Result<string, never> =>
          Result.succeed(
            v.apiEnv?.useProdCache === true ? PROJECT_ENV_PROD : v.envId
          )
      ),
      Result.bind(
        'connectionIds',
        (v): Result.Result<string[], never> =>
          Result.succeed(
            v.eligibleConnections.map(connection => connection.connectionId)
          )
      ),
      Result.bind(
        'cachedColumns',
        async (
          v
        ): Result.ResultAsync<
          CachedColumnTab[],
          CachedColumnEntToTabResultError
        > =>
          v.connectionIds.length === 0
            ? Result.succeed([])
            : this.db.drizzle.query.cachedColumnsTable
                .findMany({
                  where: and(
                    eq(cachedColumnsTable.projectId, v.projectId),
                    eq(cachedColumnsTable.envId, v.cacheEnvId),
                    inArray(cachedColumnsTable.connectionId, v.connectionIds)
                  )
                })
                .then(cachedColumnEnts =>
                  Result.sequence(cachedColumnEnts, cachedColumnEnt =>
                    this.tabService.cachedColumnEntToTabResult({
                      cachedColumnEnt: cachedColumnEnt
                    })
                  )
                )
      ),
      Result.bind(
        'combinedSchemaItems',
        (v): Result.Result<CombinedSchemaItem[], never> =>
          Result.succeed(
            this.buildCombinedSchema({
              connectionRawSchemaItems: v.connectionRawSchemaItems,
              extraSchemas: v.struct.extraSchemas ?? [],
              cachedColumns: v.cachedColumns.map(cachedColumn =>
                this.cachedColumnService.cachedColumnTabToApi({
                  cachedColumn: cachedColumn
                })
              )
            })
          )
      ),
      Result.map(
        (v): ToBackendGetConnectionSchemasOutput => ({
          userMember: this.membersService.tabToApi({ member: v.userMember }),
          combinedSchemaItems: v.combinedSchemaItems
        })
      )
    );
  }

  private async fetchAndSaveSchemas(item: {
    connections: ConnectionTab[];
  }): Promise<ConnectionRawSchemaItem[]> {
    let { connections } = item;

    let results: ConnectionRawSchemaItem[] = [];

    await Promise.all(
      connections.map(async connection => {
        let schema: ConnectionRawSchema;

        if (connection.type === 'PostgreSQL') {
          schema = await this.pgService.fetchSchema({
            connection: connection
          });
        } else if (connection.type === 'MySQL') {
          schema = await this.mysqlService.fetchSchema({
            connection: connection
          });
        } else if (connection.type === 'SnowFlake') {
          schema = await this.snowFlakeService.fetchSchema({
            connection: connection
          });
        } else if (connection.type === 'Databricks') {
          schema = await this.databricksService.fetchSchema({
            connection: connection
          });
        } else if (connection.type === 'BigQuery') {
          schema = await this.bigQueryService.fetchSchema({
            connection: connection
          });
        } else if (connection.type === 'MotherDuck') {
          schema = await this.duckDbService.fetchSchema({
            connection: connection
          });
        } else if (connection.type === 'Presto') {
          schema = await this.prestoService.fetchSchema({
            connection: connection
          });
        } else if (connection.type === 'Trino') {
          schema = await this.trinoService.fetchSchema({
            connection: connection
          });
        }

        if (isDefined(schema)) {
          connection.rawSchema = schema;
        }

        results.push({
          connectionId: connection.connectionId,
          schema: schema
        });
      })
    );

    let connectionsToUpdate = connections.filter(c => isDefined(c.rawSchema));

    if (connectionsToUpdate.length > 0) {
      let serverTs = makeTsNumber();

      await forEachSeries(connectionsToUpdate, async c => {
        let connectionSt: ConnectionSt = { options: c.options };
        let connectionLt: ConnectionLt = { rawSchema: c.rawSchema };

        let entProps = this.tabToEntService.getEntProps({
          dataSt: connectionSt,
          dataLt: connectionLt,
          isMetadata: false
        });

        await this.db.drizzle.execute(
          sql`UPDATE connections SET lt = ${JSON.stringify(entProps.lt)}::json, server_ts = ${serverTs} WHERE connection_full_id = ${c.connectionFullId}`
        );
      });
    }

    return results;
  }

  buildCombinedSchema(item: {
    connectionRawSchemaItems: ConnectionRawSchemaItem[];
    extraSchemas: ExtraSchema[];
    cachedColumns: CachedColumn[];
  }): CombinedSchemaItem[] {
    let { connectionRawSchemaItems, extraSchemas, cachedColumns } = item;

    // Build relationship lookup
    let relLookup: {
      key: string;
      relationshipType: RelationshipType;
      targetSchemaName: string;
      targetTableName: string;
      targetColumnName: string;
    }[] = [];

    extraSchemas.forEach(sch => {
      let dotIndex = sch.schema.indexOf('.');
      let connectionId = sch.schema.substring(0, dotIndex);
      let fromSchemaName = sch.schema.substring(dotIndex + 1);

      (sch.tables ?? []).forEach(tbl => {
        (tbl.columns ?? []).forEach(col => {
          (col.relationships ?? []).forEach(rel => {
            let [toTableName, toColumnName] = rel.to.split('.');

            let toSchemaName = rel.toSchema
              ? rel.toSchema.substring(rel.toSchema.indexOf('.') + 1)
              : fromSchemaName;

            // Forward entry
            relLookup.push({
              key: `${connectionId}.${fromSchemaName}.${tbl.table}.${col.column}`,
              relationshipType: rel.type,
              targetSchemaName: toSchemaName,
              targetTableName: toTableName,
              targetColumnName: toColumnName
            });

            // Reverse entry
            let reverseType: RelationshipType =
              rel.type === 'many_to_one'
                ? 'one_to_many'
                : rel.type === 'one_to_many'
                  ? 'many_to_one'
                  : rel.type;

            relLookup.push({
              key: `${connectionId}.${toSchemaName}.${toTableName}.${toColumnName}`,
              relationshipType: reverseType,
              targetSchemaName: fromSchemaName,
              targetTableName: tbl.table,
              targetColumnName: col.column
            });
          });
        });
      });
    });

    // Build combined schema items
    let combinedSchemaItems: CombinedSchemaItem[] = [];

    connectionRawSchemaItems.forEach(rawItem => {
      let connectionId = rawItem.connectionId;
      let rawSchema = rawItem.schema;

      if (!isDefined(rawSchema)) {
        return;
      }

      if (isDefined(rawSchema.errorMessage)) {
        combinedSchemaItems.push({
          connectionId: connectionId,
          schemas: [],
          lastRefreshedTs: rawSchema.lastRefreshedTs,
          errorMessage: rawSchema.errorMessage
        });
        return;
      }

      // Group raw tables by schemaName
      let schemaGroups: {
        schemaName: string;
        tables: typeof rawSchema.tables;
      }[] = [];

      rawSchema.tables.forEach(t => {
        let group = schemaGroups.find(g => g.schemaName === t.schemaName);
        if (!group) {
          group = { schemaName: t.schemaName, tables: [] };
          schemaGroups.push(group);
        }
        group.tables.push(t);
      });

      let combinedSchemas: CombinedSchema[] = [];

      schemaGroups.forEach(schemaGroup => {
        let schemaName = schemaGroup.schemaName;
        let rawTables = schemaGroup.tables;

        let extraSch = extraSchemas.find(
          s => s.schema === `${connectionId}.${schemaName}`
        );

        let combinedTables: CombinedSchemaTable[] = rawTables.map(rawTable => {
          let extraTable = extraSch?.tables?.find(
            t => t.table === rawTable.tableName
          );

          let combinedColumns: CombinedSchemaColumn[] = rawTable.columns.map(
            rawCol => {
              let extraCol = extraTable?.columns?.find(
                c => c.column === rawCol.columnName
              );

              let cachedColumn = cachedColumns.find(
                x =>
                  x.connectionId === connectionId &&
                  x.schemaName === schemaName &&
                  x.tableName === rawTable.tableName &&
                  x.columnName === rawCol.columnName
              );

              let combinedRefs: ColumnCombinedReference[] = [];

              // Add FK entries
              let foreignKeys = rawCol.foreignKeys || [];

              foreignKeys.forEach(fk => {
                let schemaNameDiffers = fk.referencedSchemaName !== schemaName;

                combinedRefs.push({
                  isForeignKey: true,
                  referencedSchemaName: schemaNameDiffers
                    ? fk.referencedSchemaName
                    : undefined,
                  referencedTableName: fk.referencedTableName,
                  referencedColumnName: fk.referencedColumnName
                });
              });

              // Add relationship entries
              let lookupKey = `${connectionId}.${schemaName}.${rawTable.tableName}.${rawCol.columnName}`;

              let relEntries = relLookup.filter(x => x.key === lookupKey);

              relEntries.forEach(relEntry => {
                let existing = combinedRefs.find(
                  x =>
                    x.referencedTableName === relEntry.targetTableName &&
                    x.referencedColumnName === relEntry.targetColumnName &&
                    (x.referencedSchemaName || schemaName) ===
                      relEntry.targetSchemaName
                );

                if (existing) {
                  existing.relationshipType = relEntry.relationshipType;
                } else {
                  let schemaNameDiffers =
                    relEntry.targetSchemaName !== schemaName;

                  combinedRefs.push({
                    relationshipType: relEntry.relationshipType,
                    isForeignKey: false,
                    referencedSchemaName: schemaNameDiffers
                      ? relEntry.targetSchemaName
                      : undefined,
                    referencedTableName: relEntry.targetTableName,
                    referencedColumnName: relEntry.targetColumnName
                  });
                }
              });

              let combinedColumn: CombinedSchemaColumn = {
                columnName: rawCol.columnName,
                dataType: rawCol.dataType,
                isNullable: rawCol.isNullable,
                isPrimaryKey: rawCol.isPrimaryKey,
                isUnique: rawCol.isUnique,
                foreignKeys: rawCol.foreignKeys,
                description: extraCol?.description,
                example: extraCol?.example,
                cacheUniqueValues: extraCol?.cacheUniqueValues,
                references: combinedRefs.length > 0 ? combinedRefs : undefined,
                cachedColumn: cachedColumn
              };

              return combinedColumn;
            }
          );

          let sortedColumns = sortSchemaColumns({ columns: combinedColumns });

          let combinedTable: CombinedSchemaTable = {
            tableName: rawTable.tableName,
            tableType: rawTable.tableType,
            columns: sortedColumns,
            indexes: rawTable.indexes,
            description: extraTable?.description
          };

          return combinedTable;
        });

        let combinedSchema: CombinedSchema = {
          schemaName: schemaName,
          description: extraSch?.description,
          tables: combinedTables
        };

        combinedSchemas.push(combinedSchema);
      });

      combinedSchemaItems.push({
        connectionId: connectionId,
        schemas: combinedSchemas,
        lastRefreshedTs: rawSchema.lastRefreshedTs
      });
    });

    return combinedSchemaItems;
  }
}
