import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendQueryDoesNotExistError = {
  code: 'BACKEND_QUERY_DOES_NOT_EXIST';
};

export let zBackendQueryDoesNotExistError = z.object({
  code: z.literal('BACKEND_QUERY_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendQueryDoesNotExistError,
  z.infer<typeof zBackendQueryDoesNotExistError>
>({ value: true });
