import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRegisterUserRequest = {
  operation: 'registerUser';
  traceId: string;
  idempotencyKey: string;
  input: {
    email: string;
    password: string;
  };
};

export let zToBackendRegisterUserRequest = z
  .strictObject({
    operation: z.literal('registerUser'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        email: z.string(),
        password: z.string()
      })
      .meta({ id: 'ToBackendRegisterUserInput' })
  })
  .meta({ id: 'ToBackendRegisterUserRequest' });

assertTypesEqual<
  ToBackendRegisterUserRequest,
  z.infer<typeof zToBackendRegisterUserRequest>
>({ value: true });
