import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendResetUserPasswordInput = {
  email: string;
};

export type ToBackendResetUserPasswordRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendResetUserPasswordInput;
};

export let zToBackendResetUserPasswordInput = z
  .object({
    email: z.string()
  })
  .meta({ id: 'ToBackendResetUserPasswordInput' });

export let zToBackendResetUserPasswordRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendResetUserPasswordInput
  })
  .meta({ id: 'ToBackendResetUserPasswordRequest' });

assertTypesEqual<
  ToBackendResetUserPasswordInput,
  z.infer<typeof zToBackendResetUserPasswordInput>
>({ value: true });

assertTypesEqual<
  ToBackendResetUserPasswordRequest,
  z.infer<typeof zToBackendResetUserPasswordRequest>
>({ value: true });
