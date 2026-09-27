import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserInput = Record<string, never>;

export type ToBackendDeleteUserRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendDeleteUserInput;
};

export let zToBackendDeleteUserInput = z
  .object({})
  .meta({ id: 'ToBackendDeleteUserInput' });

export let zToBackendDeleteUserRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendDeleteUserInput
  })
  .meta({ id: 'ToBackendDeleteUserRequest' });

assertTypesEqual<
  ToBackendDeleteUserInput,
  z.infer<typeof zToBackendDeleteUserInput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteUserRequest,
  z.infer<typeof zToBackendDeleteUserRequest>
>({ value: true });
