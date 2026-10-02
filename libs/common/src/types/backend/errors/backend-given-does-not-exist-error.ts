import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendGivenDoesNotExistError = {
  code: 'BACKEND_GIVEN_DOES_NOT_EXIST';
};

export let zBackendGivenDoesNotExistError = z.object({
  code: z.literal('BACKEND_GIVEN_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendGivenDoesNotExistError,
  z.infer<typeof zBackendGivenDoesNotExistError>
>({ value: true });
