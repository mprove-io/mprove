import { z } from 'zod';

export let zRawSchemaIndex = z.object({
  indexName: z.string(),
  indexColumns: z.array(z.string()),
  isUnique: z.boolean(),
  isPrimaryKey: z.boolean()
});
