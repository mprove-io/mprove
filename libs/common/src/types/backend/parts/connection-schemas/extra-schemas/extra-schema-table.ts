import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ExtraSchemaColumn,
  zExtraSchemaColumn
} from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema-column';

export type ExtraSchemaTable = {
  table: string;
  description?: string;
  columns: ExtraSchemaColumn[];
};

export let zExtraSchemaTable = z
  .object({
    table: z.string(),
    description: z.string().nullish(),
    columns: z.array(zExtraSchemaColumn)
  })
  .meta({ id: 'ExtraSchemaTable' });

assertTypesEqual<ExtraSchemaTable, z.infer<typeof zExtraSchemaTable>>({
  value: true
});
