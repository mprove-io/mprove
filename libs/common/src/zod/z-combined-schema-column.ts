import { z } from 'zod';
import { zColumnCombinedReference } from '#common/zod/z-column-combined-reference';
import { zRawSchemaForeignKey } from '#common/zod/z-raw-schema-foreign-key';

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
