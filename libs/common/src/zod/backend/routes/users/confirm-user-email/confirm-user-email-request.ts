import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendConfirmUserEmailInput = {
  emailVerificationToken: string;
};

export type ToBackendConfirmUserEmailRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendConfirmUserEmailInput;
};

export let zToBackendConfirmUserEmailInput = z
  .object({
    emailVerificationToken: z.string()
  })
  .meta({ id: 'ToBackendConfirmUserEmailInput' });

export let zToBackendConfirmUserEmailRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendConfirmUserEmailInput
  })
  .meta({ id: 'ToBackendConfirmUserEmailRequest' });

assertTypesEqual<
  ToBackendConfirmUserEmailInput,
  z.infer<typeof zToBackendConfirmUserEmailInput>
>({ value: true });

assertTypesEqual<
  ToBackendConfirmUserEmailRequest,
  z.infer<typeof zToBackendConfirmUserEmailRequest>
>({ value: true });
