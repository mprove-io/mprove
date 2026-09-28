import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/zod/backend/user';

export type ToBackendCompleteUserRegistrationOutput = {
  token?: string;
  user?: User;
};

export let zToBackendCompleteUserRegistrationOutput = z
  .object({
    token: z.string().nullish(),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendCompleteUserRegistrationOutput' });

assertTypesEqual<
  ToBackendCompleteUserRegistrationOutput,
  z.infer<typeof zToBackendCompleteUserRegistrationOutput>
>({ value: true });
