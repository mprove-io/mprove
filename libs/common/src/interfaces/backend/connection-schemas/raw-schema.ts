export class RawSchemaForeignKey {
  constraintName: string;
  referencedSchemaName: string;
  referencedTableName: string;
  referencedColumnName: string;
}

export class RawSchemaColumn {
  columnName: string;
  dataType: string;
  elementType?: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeys: RawSchemaForeignKey[];
}

export class RawSchemaIndex {
  indexName: string;
  indexColumns: string[];
  isUnique: boolean;
  isPrimaryKey: boolean;
}

export class RawSchemaTable {
  schemaName: string;
  tableName: string;
  tableType: string;
  columns: RawSchemaColumn[];
  indexes: RawSchemaIndex[];
}

export class ConnectionRawSchema {
  tables: RawSchemaTable[];
  lastRefreshedTs: number;
  errorMessage?: string;
}
