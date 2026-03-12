import { Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { and, eq, inArray, or, sql } from 'drizzle-orm';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  ConnectionTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { connectionsTable } from '#backend/drizzle/postgres/schema/connections';
import { makeTsNumber } from '#backend/functions/make-ts-number';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '#backend/guards/validate-request.guard';
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
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import {
  ColumnCombinedReference,
  ConnectionSchema,
  ConnectionSchemaItem
} from '#common/interfaces/backend/connection-schema';
import { MproveConfigRelationship } from '#common/interfaces/backend/mprove-config-relationship';
import { ConnectionLt, ConnectionSt } from '#common/interfaces/st-lt';
import {
  ToBackendGetConnectionSchemasRequest,
  ToBackendGetConnectionSchemasResponsePayload
} from '#common/interfaces/to-backend/connections/to-backend-get-connection-schemas';

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GetConnectionSchemasController {
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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGetConnectionSchemas)
  async getConnectionSchemas(@AttachUser() user: UserTab, @Req() request: any) {
    let reqValid: ToBackendGetConnectionSchemasRequest = request.body;
    let { projectId, envId, repoId, branchId, isRefresh } = reqValid.payload;

    isRefresh = isRefresh !== false;

    await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let userMember = await this.membersService.getMemberCheckIsEditorOrAdmin({
      memberId: user.userId,
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

    let relationships = struct.mproveConfig?.relationships || [];

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

    let connectionSchemaItems: ConnectionSchemaItem[];

    if (isRefresh === true) {
      let schemaResults: ConnectionSchemaItem[] = await Promise.all(
        eligibleConnections.map(async connection => {
          let schema: ConnectionSchema;

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
            connection.schema = schema;
          }

          return {
            connectionId: connection.connectionId,
            schema: schema
          };
        })
      );

      let connectionsToUpdate = eligibleConnections.filter(c =>
        isDefined(c.schema)
      );

      if (connectionsToUpdate.length > 0) {
        let serverTs = makeTsNumber();

        for (let c of connectionsToUpdate) {
          let connectionSt: ConnectionSt = { options: c.options };
          let connectionLt: ConnectionLt = { schema: c.schema };

          let entProps = this.tabToEntService.getEntProps({
            dataSt: connectionSt,
            dataLt: connectionLt,
            isMetadata: false
          });

          await this.db.drizzle.execute(
            sql`UPDATE connections SET lt = ${JSON.stringify(entProps.lt)}::json, server_ts = ${serverTs} WHERE connection_full_id = ${c.connectionFullId}`
          );
        }
      }

      connectionSchemaItems = schemaResults;
    } else {
      connectionSchemaItems = eligibleConnections
        .filter(x => isDefined(x.schema))
        .map(x => ({
          connectionId: x.connectionId,
          schema: x.schema
        }));
    }

    this.buildCombinedReferences({
      connectionSchemaItems: connectionSchemaItems,
      relationships: relationships
    });

    let apiUserMember = this.membersService.tabToApi({ member: userMember });

    let payload: ToBackendGetConnectionSchemasResponsePayload = {
      userMember: apiUserMember,
      connectionSchemaItems: connectionSchemaItems
    };

    return payload;
  }

  private buildCombinedReferences(item: {
    connectionSchemaItems: ConnectionSchemaItem[];
    relationships: MproveConfigRelationship[];
  }) {
    let { connectionSchemaItems, relationships } = item;

    // Build relationship lookup as array of {key, entries}
    let relLookup: {
      key: string;
      relationshipType: RelationshipTypeEnum;
      targetSchemaName: string;
      targetTableName: string;
      targetColumnName: string;
    }[] = [];

    relationships.forEach(rel => {
      let dotIndex = rel.schema.indexOf('.');
      let connectionId = rel.schema.substring(0, dotIndex);
      let fromSchemaName = rel.schema.substring(dotIndex + 1);

      rel.references.forEach(ref => {
        let [fromTableName, fromColumnName] = ref.from.split('.');
        let [toTableName, toColumnName] = ref.to.split('.');

        let toSchemaName = ref.toSchema
          ? ref.toSchema.substring(ref.toSchema.indexOf('.') + 1)
          : fromSchemaName;

        // Forward entry
        relLookup.push({
          key: `${connectionId}.${fromSchemaName}.${fromTableName}.${fromColumnName}`,
          relationshipType: ref.type,
          targetSchemaName: toSchemaName,
          targetTableName: toTableName,
          targetColumnName: toColumnName
        });

        // Reverse entry
        let reverseType =
          ref.type === RelationshipTypeEnum.ManyToOne
            ? RelationshipTypeEnum.OneToMany
            : ref.type === RelationshipTypeEnum.OneToMany
              ? RelationshipTypeEnum.ManyToOne
              : ref.type;

        relLookup.push({
          key: `${connectionId}.${toSchemaName}.${toTableName}.${toColumnName}`,
          relationshipType: reverseType,
          targetSchemaName: fromSchemaName,
          targetTableName: fromTableName,
          targetColumnName: fromColumnName
        });
      });
    });

    // Build combined references for each column
    connectionSchemaItems.forEach(csItem => {
      let schema = csItem.schema;

      if (!isDefined(schema) || isDefined(schema.errorMessage)) {
        return;
      }

      schema.tables.forEach(table => {
        table.columns.forEach(col => {
          let combinedRefs: ColumnCombinedReference[] = [];

          // Add FK entries
          let foreignKeys = col.foreignKeys || [];

          foreignKeys.forEach(fk => {
            let schemaNameDiffers =
              fk.referencedSchemaName !== table.schemaName;

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
          let lookupKey = `${csItem.connectionId}.${table.schemaName}.${table.tableName}.${col.columnName}`;

          let relEntries = relLookup.filter(x => x.key === lookupKey);

          relEntries.forEach(relEntry => {
            let existing = combinedRefs.find(
              x =>
                x.referencedTableName === relEntry.targetTableName &&
                x.referencedColumnName === relEntry.targetColumnName &&
                (x.referencedSchemaName || table.schemaName) ===
                  relEntry.targetSchemaName
            );

            if (existing) {
              existing.relationshipType = relEntry.relationshipType;
            } else {
              let schemaNameDiffers =
                relEntry.targetSchemaName !== table.schemaName;

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

          if (combinedRefs.length > 0) {
            col.combinedReferences = combinedRefs;
          }
        });
      });
    });
  }
}
