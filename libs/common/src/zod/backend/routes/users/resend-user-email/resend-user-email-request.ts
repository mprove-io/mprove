import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendResendUserEmailInput = {
  userId: string;
};

export type ToBackendResendUserEmailRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendResendUserEmailInput;
};

export let zToBackendResendUserEmailInput = z
  .object({
    userId: z.string()
  })
  .meta({ id: 'ToBackendResendUserEmailInput' });

export let zToBackendResendUserEmailRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendResendUserEmailInput
  })
  .meta({ id: 'ToBackendResendUserEmailRequest' });

assertTypesEqual<
  ToBackendResendUserEmailInput,
  z.infer<typeof zToBackendResendUserEmailInput>
>({ value: true });

assertTypesEqual<
  ToBackendResendUserEmailRequest,
  z.infer<typeof zToBackendResendUserEmailRequest>
>({ value: true });
