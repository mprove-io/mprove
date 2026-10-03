import { z } from 'zod';
import { RelationshipTypeEnum } from '#common/enums/relationship-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { EnumValues } from '#common/types/enum-values';

export type FileSchemaRelationship = {
  to?: string;
  to_line_num?: number;
  to_schema?: string;
  to_schema_line_num?: number;
  type?: EnumValues<typeof RelationshipTypeEnum>;
  type_line_num?: number;
};

export let zFileSchemaRelationship = z
  .object({
    to: z.string().nullish(),
    to_line_num: z.number().nullish(),
    to_schema: z.string().nullish(),
    to_schema_line_num: z.number().nullish(),
    type: z.enum(RelationshipTypeEnum).nullish(),
    type_line_num: z.number().nullish()
  })
  .meta({ id: 'FileSchemaRelationship' });

assertTypesEqual<
  FileSchemaRelationship,
  z.infer<typeof zFileSchemaRelationship>
>({ value: true });
