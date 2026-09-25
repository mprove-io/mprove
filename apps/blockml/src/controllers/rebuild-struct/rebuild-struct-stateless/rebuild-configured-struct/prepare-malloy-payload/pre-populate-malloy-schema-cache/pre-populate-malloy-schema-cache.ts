import type { FieldDef, TableSourceDef } from '@malloydata/malloy';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { ProjectConnection } from '#common/zod/backend/project-connection';
import type { MalloyConnection } from '#node-common/functions/malloy/make-malloy-connections/make-malloy-connections';
import { columnToFieldDef } from './column-to-field-def/column-to-field-def';
import { getDialect } from './get-dialect/get-dialect';

export function prePopulateMalloySchemaCache(item: {
  malloyConnections: MalloyConnection[];
  projectConnections: ProjectConnection[];
}): void {
  let { malloyConnections, projectConnections } = item;

  projectConnections.forEach(pc => {
    if (!isDefined(pc.rawSchema) || !isDefined(pc.type)) {
      return;
    }

    let connection = malloyConnections.find(mc => mc.name === pc.connectionId);

    if (!isDefined(connection)) {
      return;
    }

    let dialect = getDialect({ connectionType: pc.type });

    if (!isDefined(dialect)) {
      return;
    }

    let schemaCache: Record<
      string,
      { schema: TableSourceDef; timestamp: number }
    > = (connection as any).schemaCache ?? {};

    pc.rawSchema.tables.forEach(table => {
      // Snowflake VARIANT/ARRAY/OBJECT columns require live DB sampling
      // to discover their nested schema. Skip tables that contain these
      // columns so Malloy falls back to its own fetching + sampling.
      // ref: malloy/packages/malloy-db-snowflake/src/snowflake_connection.ts
      //   schemaFromTablePath (line 348) — samples 100 rows for VARIANT columns
      if (pc.type === ConnectionTypeEnum.SnowFlake) {
        let snowflakeVariantTypes = ['variant', 'array', 'object'];
        let hasVariant = table.columns.some(col =>
          snowflakeVariantTypes.includes(col.dataType.toLowerCase())
        );
        if (hasVariant) {
          return;
        }
      }

      let tablePath = `${table.schemaName}.${table.tableName}`;

      let fields: FieldDef[] = [];

      table.columns.forEach(col => {
        let fieldDef = columnToFieldDef({
          connectionType: pc.type,
          dialect: dialect,
          col: col
        });
        fields.push(fieldDef);
      });

      let structDef: TableSourceDef = {
        type: 'table',
        name: tablePath,
        dialect: dialect.name,
        tablePath: tablePath,
        connection: pc.connectionId,
        fields: fields
      };

      schemaCache[tablePath] = {
        schema: structDef,
        timestamp: pc.rawSchema.lastRefreshedTs
      };
    });

    (connection as any).schemaCache = schemaCache;
  });
}
