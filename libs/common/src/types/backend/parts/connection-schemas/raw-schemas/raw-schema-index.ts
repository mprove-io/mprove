import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type RawSchemaIndex = {
  indexName: string;
  indexColumns: string[];
  isUnique: boolean;
  isPrimaryKey: boolean;
};

export let zRawSchemaIndex = z
  .object({
    indexName: z.string(),
    indexColumns: z.array(z.string()),
    isUnique: z.boolean(),
    isPrimaryKey: z.boolean()
  })
  .meta({ id: 'RawSchemaIndex' });

assertTypesEqual<RawSchemaIndex, z.infer<typeof zRawSchemaIndex>>({
  value: true
});
