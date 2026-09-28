import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetAvatarBigOutput = {
  avatarSmall: string;
  avatarBig: string;
};

export let zToBackendGetAvatarBigOutput = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string()
  })
  .meta({ id: 'ToBackendGetAvatarBigOutput' });

assertTypesEqual<
  ToBackendGetAvatarBigOutput,
  z.infer<typeof zToBackendGetAvatarBigOutput>
>({ value: true });
