import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type AvatarLt = {
  avatarBig: string;
};

export let zAvatarLt = z
  .object({ avatarBig: z.string() })
  .meta({ id: 'AvatarLt' });

assertTypesEqual<AvatarLt, z.infer<typeof zAvatarLt>>({ value: true });
