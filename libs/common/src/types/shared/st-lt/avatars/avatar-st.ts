import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type AvatarSt = {
  avatarSmall: string;
};

export let zAvatarSt = z
  .object({ avatarSmall: z.string() })
  .meta({ id: 'AvatarSt' });

assertTypesEqual<AvatarSt, z.infer<typeof zAvatarSt>>({ value: true });
