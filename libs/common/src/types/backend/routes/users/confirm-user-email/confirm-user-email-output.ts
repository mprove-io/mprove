import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/types/backend/user';

export type ToBackendConfirmUserEmailOutput = {
  token?: string;
  user?: User;
};

export let zToBackendConfirmUserEmailOutput = z
  .object({
    token: z.string().nullish(),
    user: zUser.nullish()
  })
  .meta({ id: 'ToBackendConfirmUserEmailOutput' });

assertTypesEqual<
  ToBackendConfirmUserEmailOutput,
  z.infer<typeof zToBackendConfirmUserEmailOutput>
>({ value: true });
