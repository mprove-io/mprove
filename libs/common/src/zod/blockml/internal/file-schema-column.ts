import { z } from 'zod';
import { zFileSchemaRelationship } from '#common/zod/blockml/internal/file-schema-relationship';

export let zFileSchemaColumn = z
  .object({
    column: z.string().nullish(),
    column_line_num: z.number().nullish(),
    example: z.string().nullish(),
    example_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    relationships: z.array(zFileSchemaRelationship).nullish(),
    relationships_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSchemaColumn' });

export type FileSchemaColumn = z.infer<typeof zFileSchemaColumn>;
