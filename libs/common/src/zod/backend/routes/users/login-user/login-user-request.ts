import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendLoginUserRequest = {
  operation: 'loginUser';
  traceId: string;
  idempotencyKey: string;
  input: {
    email: string;
    password: string;
  };
};

export let zToBackendLoginUserRequest = z
  .strictObject({
    operation: z.literal('loginUser'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        email: z.string(),
        password: z.string()
      })
      .meta({ id: 'ToBackendLoginUserInput' })
  })
  .meta({ id: 'ToBackendLoginUserRequest' });

assertTypesEqual<
  ToBackendLoginUserRequest,
  z.infer<typeof zToBackendLoginUserRequest>
>({ value: true });
