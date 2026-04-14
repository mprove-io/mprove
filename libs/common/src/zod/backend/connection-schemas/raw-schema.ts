import { z } from 'zod';

export let zRawSchemaForeignKey = z
  .object({
    constraintName: z.string(),
    referencedSchemaName: z.string(),
    referencedTableName: z.string(),
    referencedColumnName: z.string()
  })
  .meta({ id: 'RawSchemaForeignKey' });

export type ZRawSchemaForeignKey = z.infer<typeof zRawSchemaForeignKey>;

export let zRawSchemaIndex = z
  .object({
    indexName: z.string(),
    indexColumns: z.array(z.string()),
    isUnique: z.boolean(),
    isPrimaryKey: z.boolean()
  })
  .meta({ id: 'RawSchemaIndex' });

export type ZRawSchemaIndex = z.infer<typeof zRawSchemaIndex>;
