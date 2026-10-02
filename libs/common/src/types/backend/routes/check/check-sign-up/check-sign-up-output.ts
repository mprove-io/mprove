import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendCheckSignUpOutput = {
  isRegisterOnlyInvitedUsers: boolean;
};

export let zToBackendCheckSignUpOutput = z
  .object({
    isRegisterOnlyInvitedUsers: z.boolean()
  })
  .meta({ id: 'ToBackendCheckSignUpOutput' });

assertTypesEqual<
  ToBackendCheckSignUpOutput,
  z.infer<typeof zToBackendCheckSignUpOutput>
>({ value: true });
