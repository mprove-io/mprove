import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ExtraSchemaTable,
  zExtraSchemaTable
} from '#common/types/backend/parts/connection-schemas/extra-schemas/extra-schema-table';

export type ExtraSchema = {
  schema: string;
  description?: string;
  tables: ExtraSchemaTable[];
};

export let zExtraSchema = z
  .object({
    schema: z.string(),
    description: z.string().nullish(),
    tables: z.array(zExtraSchemaTable)
  })
  .meta({ id: 'ExtraSchema' });

assertTypesEqual<ExtraSchema, z.infer<typeof zExtraSchema>>({ value: true });
