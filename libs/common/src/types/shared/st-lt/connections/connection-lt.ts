import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionRawSchema,
  zConnectionRawSchema
} from '#common/types/backend/parts/connection-schemas/raw-schemas/connection-raw-schema';

export type ConnectionLt = {
  rawSchema?: ConnectionRawSchema;
};

export let zConnectionLt = z
  .object({ rawSchema: zConnectionRawSchema.nullish() })
  .meta({ id: 'ConnectionLt' });

assertTypesEqual<ConnectionLt, z.infer<typeof zConnectionLt>>({ value: true });
