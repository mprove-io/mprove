import {
  type DatabricksDialect,
  type Dialect,
  type DuckDBDialect,
  type FieldDef,
  mkArrayDef,
  mkFieldDef,
  type StandardSQLDialect
} from '@malloydata/malloy';
import { BigQueryTypeParser } from '#blockml/classes/parse/parse-bigquery-type/parse-bigquery-type';
import { DatabricksTypeParser } from '#blockml/classes/parse/parse-databricks-type/parse-databricks-type';
import { TrinoPrestoSchemaParser } from '#blockml/classes/parse/parse-trino-type/parse-trino-type';
import { ConnectionTypeEnum } from '#common/enums/connection-type.enum';
import { isDefined } from '#common/functions/is-defined';
import type { RawSchemaColumn } from '#common/zod/backend/connection-schemas/raw-schema';

export function columnToFieldDef(item: {
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
