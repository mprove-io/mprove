import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { RelationshipType } from '#common/types/shared/schema/relationship-type';
import { zRelationshipType } from '#common/types/shared/schema/relationship-type';

export type ColumnCombinedReference = {
  relationshipType?: RelationshipType;
  isForeignKey: boolean;
  referencedSchemaName?: string;
  referencedTableName: string;
  referencedColumnName: string;
};

export let zColumnCombinedReference = z
  .object({
    relationshipType: zRelationshipType.nullish(),
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
