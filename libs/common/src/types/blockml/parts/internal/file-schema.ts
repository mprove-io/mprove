import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileBasic,
  zFileBasic
} from '#common/types/blockml/parts/internal/file-basic';
import {
  type FileSchemaTable,
  zFileSchemaTable
} from '#common/types/blockml/parts/internal/file-schema-table';
import type { Extend } from '#common/types/extend';

export type FileSchema = Extend<
  FileBasic,
  {
    schema?: string;
    schema_line_num?: number;
    description?: string;
    description_line_num?: number;
    tables?: FileSchemaTable[];
    tables_line_num?: number;
  }
>;

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

assertTypesEqual<FileSchema, z.infer<typeof zFileSchema>>({ value: true });
