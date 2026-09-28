import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetAvatarBigRequest = {
  operation: 'getAvatarBig';
  traceId: string;
  idempotencyKey: string;
  input: {
    avatarUserId: string;
  };
};

export let zToBackendGetAvatarBigRequest = z
  .strictObject({
    operation: z.literal('getAvatarBig'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        avatarUserId: z.string()
      })
      .meta({ id: 'ToBackendGetAvatarBigInput' })
  })
  .meta({ id: 'ToBackendGetAvatarBigRequest' });

assertTypesEqual<
  ToBackendGetAvatarBigRequest,
  z.infer<typeof zToBackendGetAvatarBigRequest>
>({ value: true });
