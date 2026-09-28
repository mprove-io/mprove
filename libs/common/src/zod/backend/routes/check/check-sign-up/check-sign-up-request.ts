import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckSignUpRequest = {
  operation: 'checkSignUp';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendCheckSignUpRequest = z
  .strictObject({
    operation: z.literal('checkSignUp'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendCheckSignUpInput' })
  })
  .meta({ id: 'ToBackendCheckSignUpRequest' });

assertTypesEqual<
  ToBackendCheckSignUpRequest,
  z.infer<typeof zToBackendCheckSignUpRequest>
>({ value: true });
