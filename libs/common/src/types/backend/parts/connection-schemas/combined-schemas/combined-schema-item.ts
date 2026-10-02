import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CombinedSchema,
  zCombinedSchema
} from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema';

export type CombinedSchemaItem = {
  connectionId: string;
  schemas: CombinedSchema[];
  lastRefreshedTs: number;
  errorMessage?: string;
};

export let zCombinedSchemaItem = z
  .object({
    connectionId: z.string(),
    schemas: z.array(zCombinedSchema),
    lastRefreshedTs: z.number().int(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'CombinedSchemaItem' });

assertTypesEqual<CombinedSchemaItem, z.infer<typeof zCombinedSchemaItem>>({
  value: true
});
