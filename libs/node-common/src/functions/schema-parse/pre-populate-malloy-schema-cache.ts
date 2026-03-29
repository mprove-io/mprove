import {
  DatabricksDialect,
  Dialect,
  DuckDBDialect,
  FieldDef,
  MySQLDialect,
  mkArrayDef,
  mkFieldDef,
  PostgresDialect,
  SnowflakeDialect,
  StandardSQLDialect,
  TableSourceDef,
  TrinoDialect
} from '@malloydata/malloy';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { isDefined } from '#common/functions/is-defined';
import { RawSchemaColumn } from '#common/interfaces/backend/connection-schemas/raw-schema';
import { ProjectConnection } from '#common/interfaces/backend/project-connection';
import { MalloyConnection } from '#node-common/functions/make-malloy-connections';
import { BigQueryTypeParser } from '#node-common/functions/schema-parse/parse-bigquery-type';
import { DatabricksTypeParser } from '#node-common/functions/schema-parse/parse-databricks-type';
import { TrinoPrestoSchemaParser } from '#node-common/functions/schema-parse/parse-trino-type';

function getDialect(item: {
  connectionType: ConnectionTypeEnum;
}): Dialect | undefined {
  let { connectionType } = item;

  let dialectMap: Partial<Record<ConnectionTypeEnum, Dialect>> = {
    [ConnectionTypeEnum.PostgreSQL]: new PostgresDialect(),
    [ConnectionTypeEnum.MySQL]: new MySQLDialect(),
    [ConnectionTypeEnum.BigQuery]: new StandardSQLDialect(),
    [ConnectionTypeEnum.SnowFlake]: new SnowflakeDialect(),
    [ConnectionTypeEnum.Databricks]: new DatabricksDialect(),
    [ConnectionTypeEnum.MotherDuck]: new DuckDBDialect(),
    [ConnectionTypeEnum.Presto]: new TrinoDialect(),
    [ConnectionTypeEnum.Trino]: new TrinoDialect()
  };

  return dialectMap[connectionType];
}

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

function columnToFieldDef(item: {
  connectionType: ConnectionTypeEnum;
  dialect: Dialect;
  col: RawSchemaColumn;
}): FieldDef {
  let { connectionType, dialect, col } = item;

  // PostgreSQL: ARRAY + elementType from information_schema.element_types JOIN
  // ref: malloy/packages/malloy-db-postgres/src/postgres_connection.ts
  //   schemaFromQuery (line 351) — same data_type/element_type pattern
  if (col.dataType === 'ARRAY' && isDefined(col.elementType)) {
    let elementType = dialect.sqlTypeToMalloyType(col.elementType);
    return mkArrayDef(elementType, col.columnName);
  }

  // DuckDB: use parseDuckDBType() for full type parsing (INTEGER[], STRUCT, etc.)
  // ref: malloy/packages/malloy-db-duckdb/src/duckdb_common.ts
  //   fillStructDefFromTypeMap (line 166) — calls dialect.parseDuckDBType()
  if (connectionType === ConnectionTypeEnum.MotherDuck) {
    let duckdbDialect = dialect as DuckDBDialect;
    let typeDef = duckdbDialect.parseDuckDBType(col.dataType);
    return mkFieldDef(typeDef, col.columnName);
  }

  // BigQuery: STRUCT<name TYPE>, ARRAY<TYPE>, nested combinations
  // ref: malloy/packages/malloy-db-bigquery/src/bigquery_connection.ts
  //   addFieldsToStructDef (line 529) — handles REPEATED mode and STRUCT recursion
  if (connectionType === ConnectionTypeEnum.BigQuery) {
    let parser = new BigQueryTypeParser(
      col.dataType,
      dialect as StandardSQLDialect
    );
    let typeDef = parser.typeDef();
    return mkFieldDef(typeDef, col.columnName);
  }

  // Databricks: struct<name:type>, array<type>, map<k,v>, decimal(p,s)
  // ref: malloy/packages/malloy-db-databricks/src/databricks_connection.ts
  //   DatabricksTypeParser (line 35) — recursive descent parser
  if (connectionType === ConnectionTypeEnum.Databricks) {
    let parser = new DatabricksTypeParser(
      col.dataType,
      dialect as DatabricksDialect
    );
    let typeDef = parser.typeDef();
    return mkFieldDef(typeDef, col.columnName);
  }

  // Trino / Presto: row(name type, ...), array(type), map(k,v)
  // ref: malloy/packages/malloy-db-trino/src/trino_connection.ts
  //   malloyTypeFromTrinoType (line 379) — uses TrinoPrestoSchemaParser
  if (
    connectionType === ConnectionTypeEnum.Trino ||
    connectionType === ConnectionTypeEnum.Presto
  ) {
    let parser = new TrinoPrestoSchemaParser(col.dataType, dialect);
    let typeDef = parser.typeDef();
    return mkFieldDef(typeDef, col.columnName);
  }

  // Default: simple type mapping (MySQL, Snowflake, and scalar types for all DWHs)
  // ref: malloy/packages/malloy-db-mysql/src/mysql_connection.ts
  //   fillStructDefFromTypeMap (line 311) — strips parens, calls sqlTypeToMalloyType
  // ref: malloy/packages/malloy-db-snowflake/src/snowflake_connection.ts
  //   schemaFromTablePath (line 348) — passes full NUMBER(p,s) for scale detection
  let malloyType = dialect.sqlTypeToMalloyType(col.dataType);
  return { ...malloyType, name: col.columnName };
}
