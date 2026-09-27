import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRegisterUserInput = {
  email: string;
  password: string;
};

export type ToBackendRegisterUserRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRegisterUserInput;
};

export let zToBackendRegisterUserInput = z
  .object({
    email: z.string(),
    password: z.string()
  })
  .meta({ id: 'ToBackendRegisterUserInput' });

export let zToBackendRegisterUserRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRegisterUserInput
  })
  .meta({ id: 'ToBackendRegisterUserRequest' });

assertTypesEqual<
  ToBackendRegisterUserInput,
  z.infer<typeof zToBackendRegisterUserInput>
>({ value: true });

assertTypesEqual<
  ToBackendRegisterUserRequest,
  z.infer<typeof zToBackendRegisterUserRequest>
>({ value: true });
