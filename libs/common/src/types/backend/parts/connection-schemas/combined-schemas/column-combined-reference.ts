import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ColumnCombinedReference = {
  relationshipType?:
    | RelationshipTypeEnum.OneToOne
    | RelationshipTypeEnum.OneToMany
    | RelationshipTypeEnum.ManyToOne
    | RelationshipTypeEnum.ManyToMany;
  isForeignKey: boolean;
  referencedSchemaName?: string;
  referencedTableName: string;
  referencedColumnName: string;
};

export let zColumnCombinedReference = z
  .object({
    relationshipType: z.enum(RelationshipTypeEnum).nullish(),
    isForeignKey: z.boolean(),
    referencedSchemaName: z.string().nullish(),
    referencedTableName: z.string(),
    referencedColumnName: z.string()
  })
  .meta({ id: 'ColumnCombinedReference' });

assertTypesEqual<
  ColumnCombinedReference,
  z.infer<typeof zColumnCombinedReference>
>({ value: true });
