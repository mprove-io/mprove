export class SchemaColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
}

export class SchemaIndex {
  indexName: string;
  indexColumns: string[];
  isUnique: boolean;
  isPrimaryKey: boolean;
}

import { SchemaTableTypeEnum } from '#common/enums/schema-table-type.enum';

export class SchemaTable {
  schemaName: string;
  tableName: string;
  tableType: SchemaTableTypeEnum;
  columns: SchemaColumn[];
  indexes: SchemaIndex[];
}

export class ConnectionSchema {
  tables: SchemaTable[];
  lastRefreshedTs: number;
  errorMessage?: string;
}

export class ConnectionSchemaItem {
  connectionId: string;
  schema: ConnectionSchema;
}
