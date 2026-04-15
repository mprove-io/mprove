import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import {
  zRawSchemaForeignKey,
  zRawSchemaIndex
} from '#common/zod/backend/connection-schemas/raw-schema';

export let zColumnCombinedReference = z
  .object({
    relationshipType: z.enum(RelationshipTypeEnum).nullish(),
    isForeignKey: z.boolean(),
    referencedSchemaName: z.string().nullish(),
    referencedTableName: z.string(),
    referencedColumnName: z.string()
  })
  .meta({ id: 'ColumnCombinedReference' });

export type ColumnCombinedReference = z.infer<typeof zColumnCombinedReference>;

export let zCombinedSchemaColumn = z
  .object({
    columnName: z.string(),
    dataType: z.string(),
    isNullable: z.boolean(),
    isPrimaryKey: z.boolean().nullish(),
    isUnique: z.boolean().nullish(),
    foreignKeys: z.array(zRawSchemaForeignKey),
    description: z.string().nullish(),
    example: z.string().nullish(),
    references: z.array(zColumnCombinedReference).nullish()
  })
  .meta({ id: 'CombinedSchemaColumn' });

export type CombinedSchemaColumn = z.infer<typeof zCombinedSchemaColumn>;

export let zCombinedSchemaTable = z
  .object({
    tableName: z.string(),
    tableType: z.string(),
    columns: z.array(zCombinedSchemaColumn),
    indexes: z.array(zRawSchemaIndex),
    description: z.string().nullish()
  })
  .meta({ id: 'CombinedSchemaTable' });

export type CombinedSchemaTable = z.infer<typeof zCombinedSchemaTable>;

export let zCombinedSchema = z
  .object({
    schemaName: z.string(),
    description: z.string().nullish(),
    tables: z.array(zCombinedSchemaTable)
  })
  .meta({ id: 'CombinedSchema' });

export type CombinedSchema = z.infer<typeof zCombinedSchema>;

export let zCombinedSchemaItem = z
  .object({
    connectionId: z.string(),
    schemas: z.array(zCombinedSchema),
    lastRefreshedTs: z.number().int(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'CombinedSchemaItem' });

export type CombinedSchemaItem = z.infer<typeof zCombinedSchemaItem>;
