import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/types/backend/parts/user';

export type ToBackendSetUserNameOutput = {
  user: User;
};

export let zToBackendSetUserNameOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserNameOutput' });

assertTypesEqual<
  ToBackendSetUserNameOutput,
  z.infer<typeof zToBackendSetUserNameOutput>
>({ value: true });
