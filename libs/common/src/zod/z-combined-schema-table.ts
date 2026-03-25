import { z } from 'zod';
import { zCombinedSchemaColumn } from '#common/zod/z-combined-schema-column';
import { zRawSchemaIndex } from '#common/zod/z-raw-schema-index';

export let zCombinedSchemaTable = z.object({
  tableName: z.string(),
  tableType: z.string(),
  columns: z.array(zCombinedSchemaColumn),
  indexes: z.array(zRawSchemaIndex),
  description: z.string().optional()
});
