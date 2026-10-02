import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetUserProfileRequest = {
  operation: 'getUserProfile';
  traceId: string;
  idempotencyKey: string;
  input: Record<string, never>;
};

export let zToBackendGetUserProfileRequest = z
  .strictObject({
    operation: z.literal('getUserProfile'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z.object({}).meta({ id: 'ToBackendGetUserProfileInput' })
  })
  .meta({ id: 'ToBackendGetUserProfileRequest' });

assertTypesEqual<
  ToBackendGetUserProfileRequest,
  z.infer<typeof zToBackendGetUserProfileRequest>
>({ value: true });
