import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProjectDoesNotExistError = {
  code: 'BACKEND_PROJECT_DOES_NOT_EXIST';
};

export let zBackendProjectDoesNotExistError = z.object({
  code: z.literal('BACKEND_PROJECT_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendProjectDoesNotExistError,
  z.infer<typeof zBackendProjectDoesNotExistError>
>({ value: true });
