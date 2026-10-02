import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RawSchemaColumn,
  zRawSchemaColumn
} from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-column';
import {
  type RawSchemaIndex,
  zRawSchemaIndex
} from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-index';

export type RawSchemaTable = {
  schemaName: string;
  tableName: string;
  tableType: string;
  columns: RawSchemaColumn[];
  indexes: RawSchemaIndex[];
};

export let zRawSchemaTable = z
  .object({
    schemaName: z.string(),
    tableName: z.string(),
    tableType: z.string(),
    columns: z.array(zRawSchemaColumn),
    indexes: z.array(zRawSchemaIndex)
  })
  .meta({ id: 'RawSchemaTable' });

assertTypesEqual<RawSchemaTable, z.infer<typeof zRawSchemaTable>>({
  value: true
});
