import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/zod/backend/user';

export type ToBackendGetUserProfileOutput = {
  user: User;
};

export let zToBackendGetUserProfileOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendGetUserProfileOutput' });

assertTypesEqual<
  ToBackendGetUserProfileOutput,
  z.infer<typeof zToBackendGetUserProfileOutput>
>({ value: true });
