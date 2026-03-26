import { z } from 'zod';

export let zColumnCombinedReference = z.object({
  relationshipType: z
    .enum(['one_to_one', 'one_to_many', 'many_to_one', 'many_to_many'])
    .optional(),
  isForeignKey: z.boolean(),
  referencedSchemaName: z.string().optional(),
  referencedTableName: z.string(),
  referencedColumnName: z.string()
});

export let zCombinedSchemaColumn = z.object({
  columnName: z.string(),
  dataType: z.string(),
  isNullable: z.boolean(),
  isPrimaryKey: z.boolean().optional(),
  isUnique: z.boolean().optional(),
  foreignKeys: z.array(zRawSchemaForeignKey),
  description: z.string().optional(),
  example: z.string().optional(),
  references: z.array(zColumnCombinedReference).optional()
});

export let zCombinedSchemaTable = z.object({
  tableName: z.string(),
  tableType: z.string(),
  columns: z.array(zCombinedSchemaColumn),
  indexes: z.array(zRawSchemaIndex),
  description: z.string().optional()
});

export let zCombinedSchema = z.object({
  schemaName: z.string(),
  description: z.string().optional(),
  tables: z.array(zCombinedSchemaTable)
});

export let zCombinedSchemaItem = z.object({
  connectionId: z.string(),
  schemas: z.array(zCombinedSchema),
  lastRefreshedTs: z.number(),
  errorMessage: z.string().optional()
});
