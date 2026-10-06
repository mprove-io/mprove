import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const schemaGraphNodeColorValues = ['orange', 'gray'] as const;

export type SchemaGraphNodeColor = (typeof schemaGraphNodeColorValues)[number];

export let zSchemaGraphNodeColor = z.enum(schemaGraphNodeColorValues);

assertTypesEqual<SchemaGraphNodeColor, z.infer<typeof zSchemaGraphNodeColor>>({
  value: true
});
