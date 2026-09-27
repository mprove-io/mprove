import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetAvatarBigInput = {
  avatarUserId: string;
};

export type ToBackendGetAvatarBigRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetAvatarBigInput;
};

export let zToBackendGetAvatarBigInput = z
  .object({
    avatarUserId: z.string()
  })
  .meta({ id: 'ToBackendGetAvatarBigInput' });

export let zToBackendGetAvatarBigRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetAvatarBigInput
  })
  .meta({ id: 'ToBackendGetAvatarBigRequest' });

assertTypesEqual<
  ToBackendGetAvatarBigInput,
  z.infer<typeof zToBackendGetAvatarBigInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetAvatarBigRequest,
  z.infer<typeof zToBackendGetAvatarBigRequest>
>({ value: true });
