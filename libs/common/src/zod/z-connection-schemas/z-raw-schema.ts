import { z } from 'zod';

export let zRawSchemaForeignKey = z.object({
  constraintName: z.string().nullish(),
  referencedSchemaName: z.string().nullish(),
  referencedTableName: z.string().nullish(),
  referencedColumnName: z.string().nullish()
});

export let zRawSchemaIndex = z.object({
  indexName: z.string().nullish(),
  indexColumns: z.array(z.string()).nullish(),
  isUnique: z.boolean().nullish(),
  isPrimaryKey: z.boolean().nullish()
});
