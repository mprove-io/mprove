import { z } from 'zod';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';
import { zFileSchemaTable } from '#common/zod/blockml/internal/file-schema-table';

export let zFileSchema = zFileBasic
  .extend({
    schema: z.string().nullish(),
    schema_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    tables: z.array(zFileSchemaTable).nullish(),
    tables_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSchema' });

export type FileSchema = z.infer<typeof zFileSchema>;
