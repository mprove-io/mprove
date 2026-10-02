import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendConfirmUserEmailRequest = {
  operation: 'confirmUserEmail';
  traceId: string;
  idempotencyKey: string;
  input: {
    emailVerificationToken: string;
  };
};

export let zToBackendConfirmUserEmailRequest = z
  .strictObject({
    operation: z.literal('confirmUserEmail'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        emailVerificationToken: z.string()
      })
      .meta({ id: 'ToBackendConfirmUserEmailInput' })
  })
  .meta({ id: 'ToBackendConfirmUserEmailRequest' });

assertTypesEqual<
  ToBackendConfirmUserEmailRequest,
  z.infer<typeof zToBackendConfirmUserEmailRequest>
>({ value: true });
