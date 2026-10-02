import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUserDoesNotExistError = {
  code: 'BACKEND_USER_DOES_NOT_EXIST';
};

export let zBackendUserDoesNotExistError = z.object({
  code: z.literal('BACKEND_USER_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendUserDoesNotExistError,
  z.infer<typeof zBackendUserDoesNotExistError>
>({ value: true });
