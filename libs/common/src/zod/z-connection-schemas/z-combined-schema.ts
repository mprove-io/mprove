import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import {
  zRawSchemaForeignKey,
  zRawSchemaIndex
} from '#common/zod/z-connection-schemas/z-raw-schema';

export let zColumnCombinedReference = z.object({
  relationshipType: z.enum(RelationshipTypeEnum).nullish(),
  isForeignKey: z.boolean().nullish(),
  referencedSchemaName: z.string().nullish(),
  referencedTableName: z.string().nullish(),
  referencedColumnName: z.string().nullish()
});

export let zCombinedSchemaColumn = z.object({
  columnName: z.string().nullish(),
  dataType: z.string().nullish(),
  isNullable: z.boolean().nullish(),
  isPrimaryKey: z.boolean().nullish(),
  isUnique: z.boolean().nullish(),
  foreignKeys: z.array(zRawSchemaForeignKey).nullish(),
  description: z.string().nullish(),
  example: z.string().nullish(),
  references: z.array(zColumnCombinedReference).nullish()
});

export let zCombinedSchemaTable = z.object({
  tableName: z.string().nullish(),
  tableType: z.string().nullish(),
  columns: z.array(zCombinedSchemaColumn).nullish(),
  indexes: z.array(zRawSchemaIndex).nullish(),
  description: z.string().nullish()
});

export let zCombinedSchema = z.object({
  schemaName: z.string().nullish(),
  description: z.string().nullish(),
  tables: z.array(zCombinedSchemaTable).nullish()
});

export let zCombinedSchemaItem = z.object({
  connectionId: z.string().nullish(),
  schemas: z.array(zCombinedSchema).nullish(),
  lastRefreshedTs: z.number().nullish(),
  errorMessage: z.string().nullish()
});
