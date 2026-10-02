import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendResendUserEmailRequest = {
  operation: 'resendUserEmail';
  traceId: string;
  idempotencyKey: string;
  input: {
    userId: string;
  };
};

export let zToBackendResendUserEmailRequest = z
  .strictObject({
    operation: z.literal('resendUserEmail'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        userId: z.string()
      })
      .meta({ id: 'ToBackendResendUserEmailInput' })
  })
  .meta({ id: 'ToBackendResendUserEmailRequest' });

assertTypesEqual<
  ToBackendResendUserEmailRequest,
  z.infer<typeof zToBackendResendUserEmailRequest>
>({ value: true });
