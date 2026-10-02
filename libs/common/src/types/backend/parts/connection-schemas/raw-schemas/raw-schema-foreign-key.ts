import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type RawSchemaForeignKey = {
  constraintName: string;
  referencedSchemaName: string;
  referencedTableName: string;
  referencedColumnName: string;
};

export let zRawSchemaForeignKey = z
  .object({
    constraintName: z.string(),
    referencedSchemaName: z.string(),
    referencedTableName: z.string(),
    referencedColumnName: z.string()
  })
  .meta({ id: 'RawSchemaForeignKey' });

assertTypesEqual<RawSchemaForeignKey, z.infer<typeof zRawSchemaForeignKey>>({
  value: true
});
