import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetUserNameInput = {
  firstName: string;
  lastName: string;
};

export type ToBackendSetUserNameRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetUserNameInput;
};

export let zToBackendSetUserNameInput = z
  .object({
    firstName: z.string(),
    lastName: z.string()
  })
  .meta({ id: 'ToBackendSetUserNameInput' });

export let zToBackendSetUserNameRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetUserNameInput
  })
  .meta({ id: 'ToBackendSetUserNameRequest' });

assertTypesEqual<
  ToBackendSetUserNameInput,
  z.infer<typeof zToBackendSetUserNameInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetUserNameRequest,
  z.infer<typeof zToBackendSetUserNameRequest>
>({ value: true });
