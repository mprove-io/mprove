import { z } from 'zod';
import { zFileSchemaColumn } from '#common/zod/blockml/internal/file-schema-column';

export let zFileSchemaTable = z
  .object({
    table: z.string().nullish(),
    table_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    columns: z.array(zFileSchemaColumn).nullish(),
    columns_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSchemaTable' });

export type FileSchemaTable = z.infer<typeof zFileSchemaTable>;
