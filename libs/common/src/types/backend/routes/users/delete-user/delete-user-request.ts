import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendDeleteUserRequest = {
  operation: 'deleteUser';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendDeleteUserRequest = z
  .strictObject({
    operation: z.literal('deleteUser'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendDeleteUserInput' })
  })
  .meta({ id: 'ToBackendDeleteUserRequest' });

assertTypesEqual<
  ToBackendDeleteUserRequest,
  z.infer<typeof zToBackendDeleteUserRequest>
>({ value: true });
