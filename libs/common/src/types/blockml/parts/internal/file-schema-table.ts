import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileSchemaColumn,
  zFileSchemaColumn
} from '#common/types/blockml/parts/internal/file-schema-column';

export type FileSchemaTable = {
  table?: string;
  table_line_num?: number;
  description?: string;
  description_line_num?: number;
  columns?: FileSchemaColumn[];
  columns_line_num?: number;
};

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

assertTypesEqual<FileSchemaTable, z.infer<typeof zFileSchemaTable>>({
  value: true
});
