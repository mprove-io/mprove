import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/types/backend/user';

export type ToBackendLoginUserOutput = {
  token: string;
  user: User;
};

export let zToBackendLoginUserOutput = z
  .object({
    token: z.string(),
    user: zUser
  })
  .meta({ id: 'ToBackendLoginUserOutput' });

assertTypesEqual<
  ToBackendLoginUserOutput,
  z.infer<typeof zToBackendLoginUserOutput>
>({ value: true });
