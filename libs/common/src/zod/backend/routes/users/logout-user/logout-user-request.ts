import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendLogoutUserInput = Record<string, never>;

export type ToBackendLogoutUserRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendLogoutUserInput;
};

export let zToBackendLogoutUserInput = z
  .object({})
  .meta({ id: 'ToBackendLogoutUserInput' });

export let zToBackendLogoutUserRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendLogoutUserInput
  })
  .meta({ id: 'ToBackendLogoutUserRequest' });

assertTypesEqual<
  ToBackendLogoutUserInput,
  z.infer<typeof zToBackendLogoutUserInput>
>({ value: true });

assertTypesEqual<
  ToBackendLogoutUserRequest,
  z.infer<typeof zToBackendLogoutUserRequest>
>({ value: true });
