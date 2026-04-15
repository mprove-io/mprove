import { z } from 'zod';

export let zRawSchemaForeignKey = z
  .object({
    constraintName: z.string(),
    referencedSchemaName: z.string(),
    referencedTableName: z.string(),
    referencedColumnName: z.string()
  })
  .meta({ id: 'RawSchemaForeignKey' });

export type RawSchemaForeignKey = z.infer<typeof zRawSchemaForeignKey>;

export let zRawSchemaColumn = z
  .object({
    columnName: z.string(),
    dataType: z.string(),
    elementType: z.string().nullish(),
    isNullable: z.boolean(),
    isPrimaryKey: z.boolean().nullish(),
    isUnique: z.boolean().nullish(),
    foreignKeys: z.array(zRawSchemaForeignKey)
  })
  .meta({ id: 'RawSchemaColumn' });

export type RawSchemaColumn = z.infer<typeof zRawSchemaColumn>;

export let zRawSchemaIndex = z
  .object({
    indexName: z.string(),
    indexColumns: z.array(z.string()),
    isUnique: z.boolean(),
    isPrimaryKey: z.boolean()
  })
  .meta({ id: 'RawSchemaIndex' });

export type RawSchemaIndex = z.infer<typeof zRawSchemaIndex>;

export let zRawSchemaTable = z
  .object({
    schemaName: z.string(),
    tableName: z.string(),
    tableType: z.string(),
    columns: z.array(zRawSchemaColumn),
    indexes: z.array(zRawSchemaIndex)
  })
  .meta({ id: 'RawSchemaTable' });

export type RawSchemaTable = z.infer<typeof zRawSchemaTable>;

export let zConnectionRawSchema = z
  .object({
    tables: z.array(zRawSchemaTable),
    lastRefreshedTs: z.number(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ConnectionRawSchema' });

export type ConnectionRawSchema = z.infer<typeof zConnectionRawSchema>;
