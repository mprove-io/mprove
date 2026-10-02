import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetAvatarRequest = {
  operation: 'setAvatar';
  traceId: string;
  idempotencyKey: string;
  input: {
    avatarBig?: string;
    avatarSmall: string;
  };
};

export let zToBackendSetAvatarRequest = z
  .strictObject({
    operation: z.literal('setAvatar'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        avatarBig: z.string().nullish(),
        avatarSmall: z.string()
      })
      .meta({ id: 'ToBackendSetAvatarInput' })
  })
  .meta({ id: 'ToBackendSetAvatarRequest' });

assertTypesEqual<
  ToBackendSetAvatarRequest,
  z.infer<typeof zToBackendSetAvatarRequest>
>({ value: true });
