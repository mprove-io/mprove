import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMemberDoesNotHaveAccessToEnvError = {
  code: 'BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV';
};

export let zBackendMemberDoesNotHaveAccessToEnvError = z.object({
  code: z.literal('BACKEND_MEMBER_DOES_NOT_HAVE_ACCESS_TO_ENV')
});

assertTypesEqual<
  BackendMemberDoesNotHaveAccessToEnvError,
  z.infer<typeof zBackendMemberDoesNotHaveAccessToEnvError>
>({ value: true });
