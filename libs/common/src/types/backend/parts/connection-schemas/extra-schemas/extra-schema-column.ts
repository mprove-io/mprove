import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ExtraSchemaRelationship,
  zExtraSchemaRelationship
} from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema-relationship';

export type ExtraSchemaColumn = {
  column: string;
  description?: string;
  example?: string;
  cacheUniqueValues?: boolean;
  relationships: ExtraSchemaRelationship[];
};

export let zExtraSchemaColumn = z
  .object({
    column: z.string(),
    description: z.string().nullish(),
    example: z.string().nullish(),
    cacheUniqueValues: z.boolean().nullish(),
    relationships: z.array(zExtraSchemaRelationship)
  })
  .meta({ id: 'ExtraSchemaColumn' });

assertTypesEqual<ExtraSchemaColumn, z.infer<typeof zExtraSchemaColumn>>({
  value: true
});
