import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type RawSchemaTable,
  zRawSchemaTable
} from '#common/types/backend/parts/connection-schemas/raw-schemas/raw-schema-table';

export type ConnectionRawSchema = {
  tables: RawSchemaTable[];
  lastRefreshedTs: number;
  errorMessage?: string;
};

export let zConnectionRawSchema = z
  .object({
    tables: z.array(zRawSchemaTable),
    lastRefreshedTs: z.number(),
    errorMessage: z.string().nullish()
  })
  .meta({ id: 'ConnectionRawSchema' });

assertTypesEqual<ConnectionRawSchema, z.infer<typeof zConnectionRawSchema>>({
  value: true
});
