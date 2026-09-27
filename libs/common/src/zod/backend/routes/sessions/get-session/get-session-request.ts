import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetSessionInput = {
  sessionId: string;
  isFetchFromOpencode: boolean;
};

export type ToBackendGetSessionRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetSessionInput;
};

export let zToBackendGetSessionInput = z
  .object({
    sessionId: z.string(),
    isFetchFromOpencode: z.boolean()
  })
  .meta({ id: 'ToBackendGetSessionInput' });

export let zToBackendGetSessionRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetSessionInput
  })
  .meta({ id: 'ToBackendGetSessionRequest' });

assertTypesEqual<
  ToBackendGetSessionInput,
  z.infer<typeof zToBackendGetSessionInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetSessionRequest,
  z.infer<typeof zToBackendGetSessionRequest>
>({ value: true });
