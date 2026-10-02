import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendStructDoesNotExistError = {
  code: 'BACKEND_STRUCT_DOES_NOT_EXIST';
};

export let zBackendStructDoesNotExistError = z.object({
  code: z.literal('BACKEND_STRUCT_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendStructDoesNotExistError,
  z.infer<typeof zBackendStructDoesNotExistError>
>({ value: true });
