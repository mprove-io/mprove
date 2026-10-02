import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RawSchemaForeignKey,
  zRawSchemaForeignKey
} from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-foreign-key';

export type RawSchemaColumn = {
  columnName: string;
  dataType: string;
  elementType?: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeys: RawSchemaForeignKey[];
};

export let zRawSchemaColumn = z
  .object({
    columnName: z.string(),
    dataType: z.string(),
    elementType: z.string().nullish(),
    isNullable: z.boolean(),
    isPrimaryKey: z.boolean().nullish(),
    isUnique: z.boolean().nullish(),
    foreignKeys: z.array(zRawSchemaForeignKey)
  })
  .meta({ id: 'RawSchemaColumn' });

assertTypesEqual<RawSchemaColumn, z.infer<typeof zRawSchemaColumn>>({
  value: true
});
