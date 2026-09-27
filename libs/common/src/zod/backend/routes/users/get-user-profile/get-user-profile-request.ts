import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetUserProfileInput = Record<string, never>;

export type ToBackendGetUserProfileRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetUserProfileInput;
};

export let zToBackendGetUserProfileInput = z
  .object({})
  .meta({ id: 'ToBackendGetUserProfileInput' });

export let zToBackendGetUserProfileRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetUserProfileInput
  })
  .meta({ id: 'ToBackendGetUserProfileRequest' });

assertTypesEqual<
  ToBackendGetUserProfileInput,
  z.infer<typeof zToBackendGetUserProfileInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetUserProfileRequest,
  z.infer<typeof zToBackendGetUserProfileRequest>
>({ value: true });
