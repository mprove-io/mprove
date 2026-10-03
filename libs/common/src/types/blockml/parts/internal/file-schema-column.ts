import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FileSchemaRelationship,
  zFileSchemaRelationship
} from '#common/types/blockml/parts/internal/file-schema-relationship';

export type FileSchemaColumn = {
  column?: string;
  column_line_num?: number;
  example?: string;
  example_line_num?: number;
  description?: string;
  description_line_num?: number;
  cache_unique_values?: string;
  cache_unique_values_line_num?: number;
  relationships?: FileSchemaRelationship[];
  relationships_line_num?: number;
};

export let zFileSchemaColumn = z
  .object({
    column: z.string().nullish(),
    column_line_num: z.number().nullish(),
    example: z.string().nullish(),
    example_line_num: z.number().nullish(),
    description: z.string().nullish(),
    description_line_num: z.number().nullish(),
    cache_unique_values: z.string().nullish(),
    cache_unique_values_line_num: z.number().nullish(),
    relationships: z.array(zFileSchemaRelationship).nullish(),
    relationships_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSchemaColumn' });

assertTypesEqual<FileSchemaColumn, z.infer<typeof zFileSchemaColumn>>({
  value: true
});
