import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendLogoutUserRequest = {
  operation: 'logoutUser';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendLogoutUserRequest = z
  .strictObject({
    operation: z.literal('logoutUser'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendLogoutUserInput' })
  })
  .meta({ id: 'ToBackendLogoutUserRequest' });

assertTypesEqual<
  ToBackendLogoutUserRequest,
  z.infer<typeof zToBackendLogoutUserRequest>
>({ value: true });
