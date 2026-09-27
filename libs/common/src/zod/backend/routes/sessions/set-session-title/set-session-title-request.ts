import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetSessionTitleInput = {
  sessionId: string;
  title: string;
};

export type ToBackendSetSessionTitleRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetSessionTitleInput;
};

export let zToBackendSetSessionTitleInput = z
  .object({
    sessionId: z.string(),
    title: z.string()
  })
  .meta({ id: 'ToBackendSetSessionTitleInput' });

export let zToBackendSetSessionTitleRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetSessionTitleInput
  })
  .meta({ id: 'ToBackendSetSessionTitleRequest' });

assertTypesEqual<
  ToBackendSetSessionTitleInput,
  z.infer<typeof zToBackendSetSessionTitleInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetSessionTitleRequest,
  z.infer<typeof zToBackendSetSessionTitleRequest>
>({ value: true });
