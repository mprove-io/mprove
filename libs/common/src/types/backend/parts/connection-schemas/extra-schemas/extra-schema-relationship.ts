import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ExtraSchemaRelationship = {
  to: string;
  toSchema?: string;
  type:
    | RelationshipTypeEnum.OneToOne
    | RelationshipTypeEnum.OneToMany
    | RelationshipTypeEnum.ManyToOne
    | RelationshipTypeEnum.ManyToMany;
};

export let zExtraSchemaRelationship = z
  .object({
    to: z.string(),
    toSchema: z.string().nullish(),
    type: z.enum(RelationshipTypeEnum)
  })
  .meta({ id: 'ExtraSchemaRelationship' });

assertTypesEqual<
  ExtraSchemaRelationship,
  z.infer<typeof zExtraSchemaRelationship>
>({ value: true });
