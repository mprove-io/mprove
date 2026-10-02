import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ColumnCombinedReference,
  zColumnCombinedReference
} from '#common/types/backend/parts/connection-schemas/combined-schemas/column-combined-reference';
import {
  type RawSchemaForeignKey,
  zRawSchemaForeignKey
} from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-foreign-key';
import {
  type CachedColumn,
  zCachedColumn
} from '#common/types/backend/parts/connections/cached-column';

export type CombinedSchemaColumn = {
  columnName: string;
  dataType: string;
  isNullable: boolean;
  isPrimaryKey?: boolean;
  isUnique?: boolean;
  foreignKeys: RawSchemaForeignKey[];
  description?: string;
  example?: string;
  cacheUniqueValues?: boolean;
  references?: ColumnCombinedReference[];
  cachedColumn?: CachedColumn;
};

export let zCombinedSchemaColumn = z
  .object({
    columnName: z.string(),
    dataType: z.string(),
    isNullable: z.boolean(),
    isPrimaryKey: z.boolean().nullish(),
    isUnique: z.boolean().nullish(),
    foreignKeys: z.array(zRawSchemaForeignKey),
    description: z.string().nullish(),
    example: z.string().nullish(),
    cacheUniqueValues: z.boolean().nullish(),
    references: z.array(zColumnCombinedReference).nullish(),
    cachedColumn: zCachedColumn.nullish()
  })
  .meta({ id: 'CombinedSchemaColumn' });

assertTypesEqual<CombinedSchemaColumn, z.infer<typeof zCombinedSchemaColumn>>({
  value: true
});
