import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetAvatarInput = {
  avatarBig?: string;
  avatarSmall: string;
};

export type ToBackendSetAvatarRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSetAvatarInput;
};

export let zToBackendSetAvatarInput = z
  .object({
    avatarBig: z.string().nullish(),
    avatarSmall: z.string()
  })
  .meta({ id: 'ToBackendSetAvatarInput' });

export let zToBackendSetAvatarRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSetAvatarInput
  })
  .meta({ id: 'ToBackendSetAvatarRequest' });

assertTypesEqual<
  ToBackendSetAvatarInput,
  z.infer<typeof zToBackendSetAvatarInput>
>({ value: true });

assertTypesEqual<
  ToBackendSetAvatarRequest,
  z.infer<typeof zToBackendSetAvatarRequest>
>({ value: true });
