import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendUpdateUserPasswordInput = {
  passwordResetToken: string;
  newPassword: string;
};

export type ToBackendUpdateUserPasswordRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendUpdateUserPasswordInput;
};

export let zToBackendUpdateUserPasswordInput = z
  .object({
    passwordResetToken: z.string(),
    newPassword: z.string()
  })
  .meta({ id: 'ToBackendUpdateUserPasswordInput' });

export let zToBackendUpdateUserPasswordRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendUpdateUserPasswordInput
  })
  .meta({ id: 'ToBackendUpdateUserPasswordRequest' });

assertTypesEqual<
  ToBackendUpdateUserPasswordInput,
  z.infer<typeof zToBackendUpdateUserPasswordInput>
>({ value: true });

assertTypesEqual<
  ToBackendUpdateUserPasswordRequest,
  z.infer<typeof zToBackendUpdateUserPasswordRequest>
>({ value: true });
