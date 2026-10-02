import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/types/backend/parts/user';

export type ToBackendRegisterUserOutput = {
  user: User;
};

export let zToBackendRegisterUserOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendRegisterUserOutput' });

assertTypesEqual<
  ToBackendRegisterUserOutput,
  z.infer<typeof zToBackendRegisterUserOutput>
>({ value: true });
