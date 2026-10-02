import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCompleteUserRegistrationRequest = {
  operation: 'completeUserRegistration';
  traceId: string;
  idempotencyKey: string;
  input: {
    emailVerificationToken: string;
    newPassword: string;
  };
};

export let zToBackendCompleteUserRegistrationRequest = z
  .strictObject({
    operation: z.literal('completeUserRegistration'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        emailVerificationToken: z.string(),
        newPassword: z.string()
      })
      .meta({ id: 'ToBackendCompleteUserRegistrationInput' })
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationRequest' });

assertTypesEqual<
  ToBackendCompleteUserRegistrationRequest,
  z.infer<typeof zToBackendCompleteUserRegistrationRequest>
>({ value: true });
