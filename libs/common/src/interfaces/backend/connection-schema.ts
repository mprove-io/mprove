import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';

export class SchemaForeignKey {
  constraintName: string;
  referencedSchemaName: string;
  referencedTableName: string;
  referencedColumnName: string;
}

export class ColumnCombinedReference {
  relationshipType?: RelationshipTypeEnum;
  isForeignKey: boolean;
  referencedSchemaName?: string;
  referencedTableName: string;
  referencedColumnName: string;
}

export class SchemaColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeys: SchemaForeignKey[];
  combinedReferences?: ColumnCombinedReference[];
}

export class SchemaIndex {
  indexName: string;
  indexColumns: string[];
  isUnique: boolean;
  isPrimaryKey: boolean;
}

export class SchemaTable {
  schemaName: string;
  tableName: string;
  tableType: string;
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
