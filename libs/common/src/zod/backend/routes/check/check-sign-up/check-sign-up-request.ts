import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckSignUpInput = Record<string, never>;

export type ToBackendCheckSignUpRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCheckSignUpInput;
};

export let zToBackendCheckSignUpInput = z
  .object({})
  .meta({ id: 'ToBackendCheckSignUpInput' });

export let zToBackendCheckSignUpRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCheckSignUpInput
  })
  .meta({ id: 'ToBackendCheckSignUpRequest' });

assertTypesEqual<
  ToBackendCheckSignUpInput,
  z.infer<typeof zToBackendCheckSignUpInput>
>({ value: true });

assertTypesEqual<
  ToBackendCheckSignUpRequest,
  z.infer<typeof zToBackendCheckSignUpRequest>
>({ value: true });
