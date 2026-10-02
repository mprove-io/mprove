import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CombinedSchemaTable,
  zCombinedSchemaTable
} from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-table';

export type CombinedSchema = {
  schemaName: string;
  description?: string;
  tables: CombinedSchemaTable[];
};

export let zCombinedSchema = z
  .object({
    schemaName: z.string(),
    description: z.string().nullish(),
    tables: z.array(zCombinedSchemaTable)
  })
  .meta({ id: 'CombinedSchema' });

assertTypesEqual<CombinedSchema, z.infer<typeof zCombinedSchema>>({
  value: true
});
