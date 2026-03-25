import { z } from 'zod';

export let zRawSchemaForeignKey = z.object({
  constraintName: z.string(),
  referencedSchemaName: z.string(),
  referencedTableName: z.string(),
  referencedColumnName: z.string()
});
