import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type CombinedSchemaColumn,
  zCombinedSchemaColumn
} from '#common/types/backend/parts/connection-schemas/combined-schemas/combined-schema-column';
import {
  type RawSchemaIndex,
  zRawSchemaIndex
} from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';

export type CombinedSchemaTable = {
  tableName: string;
  tableType: string;
  columns: CombinedSchemaColumn[];
  indexes: RawSchemaIndex[];
  description?: string;
};

export let zCombinedSchemaTable = z
  .object({
    tableName: z.string(),
    tableType: z.string(),
    columns: z.array(zCombinedSchemaColumn),
    indexes: z.array(zRawSchemaIndex),
    description: z.string().nullish()
  })
  .meta({ id: 'CombinedSchemaTable' });

assertTypesEqual<CombinedSchemaTable, z.infer<typeof zCombinedSchemaTable>>({
  value: true
});
