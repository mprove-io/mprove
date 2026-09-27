import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteSessionInput = {
  sessionId: string;
};

export type ToBackendDeleteSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteSessionInput;
};

export let zToBackendDeleteSessionInput = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendDeleteSessionInput' });

export let zToBackendDeleteSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteSessionInput
  })
  .meta({ id: 'ToBackendDeleteSessionRequest' });

assertTypesEqual<
  ToBackendDeleteSessionInput,
  z.infer<typeof zToBackendDeleteSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteSessionRequest,
  z.infer<typeof zToBackendDeleteSessionRequest>
>({ value: true });
