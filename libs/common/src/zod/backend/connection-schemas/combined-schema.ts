import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import {
  zRawSchemaForeignKey,
  zRawSchemaIndex
} from '#common/zod/backend/connection-schemas/raw-schema';

export let zColumnCombinedReference = z
  .object({
    relationshipType: z.enum(RelationshipTypeEnum).optional(),
    isForeignKey: z.boolean(),
    referencedSchemaName: z.string().optional(),
    referencedTableName: z.string(),
    referencedColumnName: z.string()
  })
  .meta({ id: 'ColumnCombinedReference' });

export type ZColumnCombinedReference = z.infer<typeof zColumnCombinedReference>;

export let zCombinedSchemaColumn = z
  .object({
    columnName: z.string(),
    dataType: z.string(),
    isNullable: z.boolean(),
    isPrimaryKey: z.boolean().optional(),
    isUnique: z.boolean().optional(),
    foreignKeys: z.array(zRawSchemaForeignKey),
    description: z.string().optional(),
    example: z.string().optional(),
    references: z.array(zColumnCombinedReference).optional()
  })
  .meta({ id: 'CombinedSchemaColumn' });

export type ZCombinedSchemaColumn = z.infer<typeof zCombinedSchemaColumn>;

export let zCombinedSchemaTable = z
  .object({
    tableName: z.string(),
    tableType: z.string(),
    columns: z.array(zCombinedSchemaColumn),
    indexes: z.array(zRawSchemaIndex),
    description: z.string().optional()
  })
  .meta({ id: 'CombinedSchemaTable' });

export type ZCombinedSchemaTable = z.infer<typeof zCombinedSchemaTable>;

export let zCombinedSchema = z
  .object({
    schemaName: z.string(),
    description: z.string().optional(),
    tables: z.array(zCombinedSchemaTable)
  })
  .meta({ id: 'CombinedSchema' });

export type ZCombinedSchema = z.infer<typeof zCombinedSchema>;

export let zCombinedSchemaItem = z
  .object({
    connectionId: z.string(),
    schemas: z.array(zCombinedSchema),
    lastRefreshedTs: z.number().int(),
    errorMessage: z.string().optional()
  })
  .meta({ id: 'CombinedSchemaItem' });

export type ZCombinedSchemaItem = z.infer<typeof zCombinedSchemaItem>;
