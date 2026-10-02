import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendUpdateUserPasswordRequest = {
  operation: 'updateUserPassword';
  traceId: string;
  idempotencyKey: string;
  input: {
    passwordResetToken: string;
    newPassword: string;
  };
};

export let zToBackendUpdateUserPasswordRequest = z
  .strictObject({
    operation: z.literal('updateUserPassword'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        passwordResetToken: z.string(),
        newPassword: z.string()
      })
      .meta({ id: 'ToBackendUpdateUserPasswordInput' })
  })
  .meta({ id: 'ToBackendUpdateUserPasswordRequest' });

assertTypesEqual<
  ToBackendUpdateUserPasswordRequest,
  z.infer<typeof zToBackendUpdateUserPasswordRequest>
>({ value: true });
