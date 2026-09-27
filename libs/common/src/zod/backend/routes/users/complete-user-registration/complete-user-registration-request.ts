import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCompleteUserRegistrationInput = {
  emailVerificationToken: string;
  newPassword: string;
};

export type ToBackendCompleteUserRegistrationRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCompleteUserRegistrationInput;
};

export let zToBackendCompleteUserRegistrationInput = z
  .object({
    emailVerificationToken: z.string(),
    newPassword: z.string()
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationInput' });

export let zToBackendCompleteUserRegistrationRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCompleteUserRegistrationInput
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationRequest' });

assertTypesEqual<
  ToBackendCompleteUserRegistrationInput,
  z.infer<typeof zToBackendCompleteUserRegistrationInput>
>({ value: true });

assertTypesEqual<
  ToBackendCompleteUserRegistrationRequest,
  z.infer<typeof zToBackendCompleteUserRegistrationRequest>
>({ value: true });
