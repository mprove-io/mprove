import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import pIteration from 'p-iteration';
import type { BackendConfig } from '#backend/config/backend-config';
import { sortSchemaColumns } from '#backend/controllers/connections/get-connection-schemas/sort-schema-columns/sort-schema-columns';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { bridgesTable } from '#backend/drizzle/postgres/schema/bridges';
import { cachedColumnsTable } from '#backend/drizzle/postgres/schema/cached-columns';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { projectsTable } from '#backend/drizzle/postgres/schema/projects';
import { cachedColumnTabToApi } from '#backend/functions/db/cached-column/cached-column-tab-to-api/cached-column-tab-to-api';
import { getApiEnvs } from '#backend/functions/db/envs/get-api-envs/get-api-envs';
import { getMemberCheckIsEditorOrAdmin } from '#backend/functions/db/members/get-member-check-is-editor-or-admin/get-member-check-is-editor-or-admin';
import { memberTabToApi } from '#backend/functions/db/members/member-tab-to-api/member-tab-to-api';
import { getStructCheckExists } from '#backend/functions/db/structs/get-struct-check-exists/get-struct-check-exists';
import { fetchBigquerySchema } from '#backend/functions/dwh/bigquery/fetch-bigquery-schema/fetch-bigquery-schema';
import { fetchDatabricksSchema } from '#backend/functions/dwh/databricks/fetch-databricks-schema/fetch-databricks-schema';
import { fetchDuckdbSchema } from '#backend/functions/dwh/duckdb/fetch-duckdb-schema/fetch-duckdb-schema';
import { fetchMysqlSchema } from '#backend/functions/dwh/mysql/fetch-mysql-schema/fetch-mysql-schema';
import { fetchPgSchema } from '#backend/functions/dwh/pg/fetch-pg-schema/fetch-pg-schema';
import { fetchPrestoSchema } from '#backend/functions/dwh/presto/fetch-presto-schema/fetch-presto-schema';
import { fetchSnowflakeSchema } from '#backend/functions/dwh/snowflake/fetch-snowflake-schema/fetch-snowflake-schema';
import { fetchTrinoSchema } from '#backend/functions/dwh/trino/fetch-trino-schema/fetch-trino-schema';
import {
  type GetEntPropsOutput,
  getEntProps
} from '#backend/functions/get-ent-props/get-ent-props';
import { makeTsNumber } from '#backend/functions/make-ts-number/make-ts-number';
import { DbService } from '#backend/services/db/db.service';
import { TabService } from '#backend/services/tab/tab.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { GetConnectionSchemasError } from '#common/types/backend/function-errors/get-connection-schemas-error';
import type { ColumnCombinedReference } from '#common/types/backend/parts/connection-schemas/combined-schemas/column-combined-reference';
import type { CombinedSchema } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema';
import type { CombinedSchemaColumn } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-column';
import type { CombinedSchemaItem } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-item';
import type { CombinedSchemaTable } from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-table';
import type { ExtraSchema } from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema';
import type { ConnectionRawSchema } from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';
import type { CachedColumn } from '#common/types/backend/parts/connections/cached-column';
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
    private cs: ConfigService<BackendConfig>,
    private tabService: TabService,
    private db: DbService,
    private logger: Logger
  ) {}

  async getConnectionSchemasUnwrap(item: {
    userId: string;
    projectId: string;
    envId: string;
    repoId: string;
    branchId: string;
    isRefreshExistingCache: boolean;
  }): Promise<ToBackendGetConnectionSchemasOutput> {
    let result: Result.Result<
      ToBackendGetConnectionSchemasOutput,
      GetConnectionSchemasError
    > = await this.getConnectionSchemas(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let output: ToBackendGetConnectionSchemasOutput = result.value;

    return output;
  }

  async getConnectionSchemas(item: {
    userId: string;
    projectId: string;
    envId: string;
    repoId: string;
    branchId: string;
    isRefreshExistingCache: boolean;
  }): Result.ResultAsync<
    ToBackendGetConnectionSchemasOutput,
    GetConnectionSchemasError
  > {
    return Result.pipe(
      Result.succeed(item),
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
      Result.bind('bridge', v =>
        this.db.bridges.findFirstCheckExists({
          where: and(
            eq(bridgesTable.projectId, v.projectId),
            eq(bridgesTable.repoId, v.repoId),
            eq(bridgesTable.branchId, v.branchId),
            eq(bridgesTable.envId, v.envId)
          )
        })
      ),
      Result.bind('struct', v =>
        getStructCheckExists({
          structId: v.bridge.structId,
          projectId: v.projectId,
          cs: this.cs,
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
      Result.bind('eligibleConnections', v =>
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
      Result.bind('connectionRawSchemaItems', async v => {
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
      }),
      Result.bind('cacheEnvId', v =>
        Result.succeed(
          v.apiEnv?.useProdCache === true ? PROJECT_ENV_PROD : v.envId
        )
      ),
      Result.bind('connectionIds', v =>
        Result.succeed(
          v.eligibleConnections.map(connection => connection.connectionId)
        )
      ),
      Result.bind('cachedColumns', async v =>
        v.connectionIds.length === 0
          ? Result.succeed([])
          : this.db.cachedColumns.findMany({
              where: and(
                eq(cachedColumnsTable.projectId, v.projectId),
                eq(cachedColumnsTable.envId, v.cacheEnvId),
                inArray(cachedColumnsTable.connectionId, v.connectionIds)
              )
            })
      ),
      Result.bind('combinedSchemaItems', v =>
        Result.succeed(
          this.buildCombinedSchema({
            connectionRawSchemaItems: v.connectionRawSchemaItems,
            extraSchemas: v.struct.extraSchemas ?? [],
            cachedColumns: v.cachedColumns.map(cachedColumn =>
              cachedColumnTabToApi({
                cachedColumn: cachedColumn
              })
            )
          })
        )
      ),
      Result.map(
        (v): ToBackendGetConnectionSchemasOutput => ({
          userMember: memberTabToApi({
            member: v.userMember
          }),
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
          schema = await fetchPgSchema({
            cs: this.cs,
            logger: this.logger,
            connection: connection
          });
        } else if (connection.type === 'MySQL') {
          schema = await fetchMysqlSchema({
            cs: this.cs,
            logger: this.logger,
            connection: connection
          });
        } else if (connection.type === 'SnowFlake') {
          schema = await fetchSnowflakeSchema({
            cs: this.cs,
            logger: this.logger,
            connection: connection
          });
        } else if (connection.type === 'Databricks') {
          schema = await fetchDatabricksSchema({
            cs: this.cs,
            logger: this.logger,
            connection: connection
          });
        } else if (connection.type === 'BigQuery') {
          schema = await fetchBigquerySchema({
            cs: this.cs,
            logger: this.logger,
            connection: connection
          });
        } else if (connection.type === 'MotherDuck') {
          schema = await fetchDuckdbSchema({
            cs: this.cs,
            logger: this.logger,
            connection: connection
          });
        } else if (connection.type === 'Presto') {
          schema = await fetchPrestoSchema({
            cs: this.cs,
            logger: this.logger,
            connection: connection
          });
        } else if (connection.type === 'Trino') {
          schema = await fetchTrinoSchema({
            cs: this.cs,
            logger: this.logger,
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

        let entProps: GetEntPropsOutput<ConnectionSt, ConnectionLt> =
          getEntProps({
            dataSt: connectionSt,
            dataLt: connectionLt,
            isMetadata: false,
            tabService: this.tabService,
            isEncryptDb:
              this.cs.get<BackendConfig['isEncryptDb']>('isEncryptDb'),
            isEncryptMetadata:
              this.cs.get<BackendConfig['isEncryptMetadata']>(
                'isEncryptMetadata'
              )
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
