import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRequest = {
  traceId: string;
  idempotencyKey: string;
  input: unknown;
};

export let zToBackendRequest = z.strictObject({
  traceId: z.string(),
  idempotencyKey: z.string(),
  input: z.unknown()
});

assertTypesEqual<ToBackendRequest, z.infer<typeof zToBackendRequest>>({
  value: true
});
