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
