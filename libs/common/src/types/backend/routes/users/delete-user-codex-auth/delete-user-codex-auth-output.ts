import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type User, zUser } from '#common/types/backend/parts/user';

export type ToBackendDeleteUserCodexAuthOutput = {
  user: User;
};

export let zToBackendDeleteUserCodexAuthOutput = z
  .object({
    user: zUser
  })
  .meta({ id: 'ToBackendDeleteUserCodexAuthOutput' });

assertTypesEqual<
  ToBackendDeleteUserCodexAuthOutput,
  z.infer<typeof zToBackendDeleteUserCodexAuthOutput>
>({ value: true });
