import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

const schemaNodeTypeValues = [
  'connection',
  'table',
  'column',
  'index',
  'error'
] as const;

export type SchemaNodeType = (typeof schemaNodeTypeValues)[number];

export let zSchemaNodeType = z.enum(schemaNodeTypeValues);

assertTypesEqual<SchemaNodeType, z.infer<typeof zSchemaNodeType>>({
  value: true
});
