import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendResetUserPasswordRequest = {
  operation: 'resetUserPassword';
  traceId: string;
  idempotencyKey: string;
  input: {
    email: string;
  };
};

export let zToBackendResetUserPasswordRequest = z
  .strictObject({
    operation: z.literal('resetUserPassword'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        email: z.string()
      })
      .meta({ id: 'ToBackendResetUserPasswordInput' })
  })
  .meta({ id: 'ToBackendResetUserPasswordRequest' });

assertTypesEqual<
  ToBackendResetUserPasswordRequest,
  z.infer<typeof zToBackendResetUserPasswordRequest>
>({ value: true });
