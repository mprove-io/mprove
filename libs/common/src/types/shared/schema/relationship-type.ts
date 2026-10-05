import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const relationshipTypeValues = [
  'one_to_one',
  'one_to_many',
  'many_to_one',
  'many_to_many'
] as const;

export type RelationshipType = (typeof relationshipTypeValues)[number];

export let zRelationshipType = z.enum(relationshipTypeValues);

assertTypesEqual<RelationshipType, z.infer<typeof zRelationshipType>>({
  value: true
});
