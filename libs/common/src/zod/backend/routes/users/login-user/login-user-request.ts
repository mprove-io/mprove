import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendLoginUserInput = {
  email: string;
  password: string;
};

export type ToBackendLoginUserRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendLoginUserInput;
};

export let zToBackendLoginUserInput = z
  .object({
    email: z.string(),
    password: z.string()
  })
  .meta({ id: 'ToBackendLoginUserInput' });

export let zToBackendLoginUserRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendLoginUserInput
  })
  .meta({ id: 'ToBackendLoginUserRequest' });

assertTypesEqual<
  ToBackendLoginUserInput,
  z.infer<typeof zToBackendLoginUserInput>
>({ value: true });

assertTypesEqual<
  ToBackendLoginUserRequest,
  z.infer<typeof zToBackendLoginUserRequest>
>({ value: true });
