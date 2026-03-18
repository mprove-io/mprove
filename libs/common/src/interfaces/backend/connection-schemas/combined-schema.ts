import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import { RawSchemaForeignKey, RawSchemaIndex } from './raw-schema';

export class ColumnCombinedReference {
  relationshipType?: RelationshipTypeEnum;
  isForeignKey: boolean;
  referencedSchemaName?: string;
  referencedTableName: string;
  referencedColumnName: string;
}

export class CombinedSchemaColumn {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeys: RawSchemaForeignKey[];
  description?: string;
  example?: string;
  references?: ColumnCombinedReference[];
}

export class CombinedSchemaTable {
  tableName: string;
  tableType: string;
  columns: CombinedSchemaColumn[];
  indexes: RawSchemaIndex[];
  description?: string;
}

export class CombinedSchema {
  schemaName: string;
  description?: string;
  tables: CombinedSchemaTable[];
}

export class CombinedSchemaItem {
  connectionId: string;
  schemas: CombinedSchema[];
  lastRefreshedTs: number;
  errorMessage?: string;
}
