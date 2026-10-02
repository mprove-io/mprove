import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetUserNameRequest = {
  operation: 'setUserName';
  traceId: string;
  idempotencyKey: string;
  input: {
    firstName: string;
    lastName: string;
  };
};

export let zToBackendSetUserNameRequest = z
  .strictObject({
    operation: z.literal('setUserName'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        firstName: z.string(),
        lastName: z.string()
      })
      .meta({ id: 'ToBackendSetUserNameInput' })
  })
  .meta({ id: 'ToBackendSetUserNameRequest' });

assertTypesEqual<
  ToBackendSetUserNameRequest,
  z.infer<typeof zToBackendSetUserNameRequest>
>({ value: true });
