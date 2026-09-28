import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserProfileCodexAuthNotSetError = {
  code: 'BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET';
};

export let zBackendUserProfileCodexAuthNotSetError = z.object({
  code: z.literal('BACKEND_USER_PROFILE_CODEX_AUTH_NOT_SET')
});

assertTypesEqual<
  BackendUserProfileCodexAuthNotSetError,
  z.infer<typeof zBackendUserProfileCodexAuthNotSetError>
>({ value: true });
