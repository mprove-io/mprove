import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/types/backend/user';

export type ToBackendSetUserUiOutput = {
  user: User;
};

export let zToBackendSetUserUiOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendSetUserUiOutput' });

assertTypesEqual<
  ToBackendSetUserUiOutput,
  z.infer<typeof zToBackendSetUserUiOutput>
>({ value: true });
