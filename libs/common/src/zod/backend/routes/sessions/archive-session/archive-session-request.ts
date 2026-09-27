import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendArchiveSessionInput = {
  sessionId: string;
};

export type ToBackendArchiveSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendArchiveSessionInput;
};

export let zToBackendArchiveSessionInput = z
  .object({
    sessionId: z.string()
  })
  .meta({ id: 'ToBackendArchiveSessionInput' });

export let zToBackendArchiveSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendArchiveSessionInput
  })
  .meta({ id: 'ToBackendArchiveSessionRequest' });

assertTypesEqual<
  ToBackendArchiveSessionInput,
  z.infer<typeof zToBackendArchiveSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendArchiveSessionRequest,
  z.infer<typeof zToBackendArchiveSessionRequest>
>({ value: true });
