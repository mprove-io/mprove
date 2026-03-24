import { Inject, Injectable } from '@nestjs/common';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import pIteration from 'p-iteration';

const { forEachSeries } = pIteration;

import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { ConnectionTab } from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { sortSchemaColumns } from '#backend/functions/sort-schema-columns';
import { BridgesService } from '#backend/services/db/bridges.service';
import { EnvsService } from '#backend/services/db/envs.service';
import { MembersService } from '#backend/services/db/members.service';
import { ProjectsService } from '#backend/services/db/projects.service';
import { StructsService } from '#backend/services/db/structs.service';
import { BigQueryService } from '#backend/services/dwh/bigquery.service';
import { DatabricksService } from '#backend/services/dwh/databricks.service';
import { DuckDbService } from '#backend/services/dwh/duckdb.service';
import { MysqlService } from '#backend/services/dwh/mysql.service';
import { PgService } from '#backend/services/dwh/pg.service';
import { PrestoService } from '#backend/services/dwh/presto.service';
import { SnowFlakeService } from '#backend/services/dwh/snowflake.service';
import { TrinoService } from '#backend/services/dwh/trino.service';
import { TabService } from '#backend/services/tab.service';
import { TabToEntService } from '#backend/services/tab-to-ent.service';
import { PROJECT_ENV_PROD } from '#common/constants/top';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ColumnCombinedReference,
  CombinedSchema,
  CombinedSchemaColumn,
  CombinedSchemaItem,
  CombinedSchemaTable
} from '#common/interfaces/backend/connection-schemas/combined-schema';
import { ExtraSchema } from '#common/interfaces/backend/connection-schemas/extra-schema';
import { ConnectionRawSchema } from '#common/interfaces/backend/connection-schemas/raw-schema';
import type { Member } from '#common/interfaces/backend/member';
import { ConnectionLt, ConnectionSt } from '#common/interfaces/st-lt';

@Injectable()
export class ConnectionSchemasService {
  constructor(
    private tabService: TabService,
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
    isRefresh: boolean;
  }): Promise<{
    userMember: Member;
    combinedSchemaItems: CombinedSchemaItem[];
  }> {
    let { userId, projectId, envId, repoId, branchId, isRefresh } = item;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: userId,
      projectId: projectId
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let extraSchemas = struct.extraSchemas ?? [];

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

    let eligibleConnections = connections.filter(
      c =>
        c.type !== ConnectionTypeEnum.GoogleApi &&
        c.type !== ConnectionTypeEnum.Api &&
        (c.type === ConnectionTypeEnum.PostgreSQL ||
          c.type === ConnectionTypeEnum.MySQL ||
          c.type === ConnectionTypeEnum.SnowFlake ||
          c.type === ConnectionTypeEnum.Databricks ||
          c.type === ConnectionTypeEnum.BigQuery ||
          c.type === ConnectionTypeEnum.MotherDuck ||
          c.type === ConnectionTypeEnum.Presto ||
          c.type === ConnectionTypeEnum.Trino)
    );

    let rawSchemasByConnection: {
      connectionId: string;
      schema: ConnectionRawSchema;
    }[] = [];

    if (isRefresh === true) {
      await Promise.all(
        eligibleConnections.map(async connection => {
          let schema: ConnectionRawSchema;

          if (connection.type === ConnectionTypeEnum.PostgreSQL) {
            schema = await this.pgService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.MySQL) {
            schema = await this.mysqlService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.SnowFlake) {
            schema = await this.snowFlakeService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.Databricks) {
            schema = await this.databricksService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.BigQuery) {
            schema = await this.bigQueryService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.MotherDuck) {
            schema = await this.duckDbService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.Presto) {
            schema = await this.prestoService.fetchSchema({
              connection: connection
            });
          } else if (connection.type === ConnectionTypeEnum.Trino) {
            schema = await this.trinoService.fetchSchema({
              connection: connection
            });
          }

          if (isDefined(schema)) {
            connection.rawSchema = schema;
          }

          rawSchemasByConnection.push({
            connectionId: connection.connectionId,
            schema: schema
          });
        })
      );

      let connectionsToUpdate = eligibleConnections.filter(c =>
        isDefined(c.rawSchema)
      );

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
    } else {
      eligibleConnections
        .filter(x => isDefined(x.rawSchema))
        .forEach(x => {
          rawSchemasByConnection.push({
            connectionId: x.connectionId,
            schema: x.rawSchema
          });
        });
    }

    let combinedSchemaItems = this.buildCombinedSchema({
      rawSchemasByConnection: rawSchemasByConnection,
      extraSchemas: extraSchemas
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    return {
      userMember: apiUserMember,
      combinedSchemaItems: combinedSchemaItems
    };
  }

  buildCombinedSchema(item: {
    rawSchemasByConnection: {
      connectionId: string;
      schema: ConnectionRawSchema;
    }[];
    extraSchemas: ExtraSchema[];
  }): CombinedSchemaItem[] {
    let { rawSchemasByConnection, extraSchemas } = item;

    // Build relationship lookup
    let relLookup: {
      key: string;
      relationshipType: RelationshipTypeEnum;
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
            let reverseType =
              rel.type === RelationshipTypeEnum.ManyToOne
                ? RelationshipTypeEnum.OneToMany
                : rel.type === RelationshipTypeEnum.OneToMany
                  ? RelationshipTypeEnum.ManyToOne
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

    rawSchemasByConnection.forEach(rawItem => {
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
                references: combinedRefs.length > 0 ? combinedRefs : undefined
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
