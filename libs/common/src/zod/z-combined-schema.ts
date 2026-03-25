import { z } from 'zod';
import { zCombinedSchemaTable } from '#common/zod/z-combined-schema-table';

export let zCombinedSchema = z.object({
  schemaName: z.string(),
  description: z.string().optional(),
  tables: z.array(zCombinedSchemaTable)
});
