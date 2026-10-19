import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendAvatarDoesNotExistError = {
  code: 'BACKEND_AVATAR_DOES_NOT_EXIST';
};

export let zBackendAvatarDoesNotExistError = z.object({
  code: z.literal('BACKEND_AVATAR_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendAvatarDoesNotExistError,
  z.infer<typeof zBackendAvatarDoesNotExistError>
>({ value: true });
