import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { RelationshipType } from '#common/types/shared/schema/relationship-type';
import { zRelationshipType } from '#common/types/shared/schema/relationship-type';

export type ExtraSchemaRelationship = {
  to: string;
  toSchema?: string;
  type: RelationshipType;
};

export let zExtraSchemaRelationship = z
  .object({
    to: z.string(),
    toSchema: z.string().nullish(),
    type: zRelationshipType
  })
  .meta({ id: 'ExtraSchemaRelationship' });

assertTypesEqual<
  ExtraSchemaRelationship,
  z.infer<typeof zExtraSchemaRelationship>
>({ value: true });
