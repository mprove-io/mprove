import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendSetAvatarOutput = {
  avatarSmall: string;
  avatarBig: string;
};

export let zToBackendSetAvatarOutput = z
  .object({
    avatarSmall: z.string(),
    avatarBig: z.string()
  })
  .meta({ id: 'ToBackendSetAvatarOutput' });

assertTypesEqual<
  ToBackendSetAvatarOutput,
  z.infer<typeof zToBackendSetAvatarOutput>
>({ value: true });
