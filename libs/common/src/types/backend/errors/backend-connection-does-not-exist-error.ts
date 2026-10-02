import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendConnectionDoesNotExistError = {
  code: 'BACKEND_CONNECTION_DOES_NOT_EXIST';
};

export let zBackendConnectionDoesNotExistError = z.object({
  code: z.literal('BACKEND_CONNECTION_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendConnectionDoesNotExistError,
  z.infer<typeof zBackendConnectionDoesNotExistError>
>({ value: true });
