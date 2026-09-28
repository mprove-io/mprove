import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendModelDoesNotExistError = {
  code: 'BACKEND_MODEL_DOES_NOT_EXIST';
};

export let zBackendModelDoesNotExistError = z.object({
  code: z.literal('BACKEND_MODEL_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendModelDoesNotExistError,
  z.infer<typeof zBackendModelDoesNotExistError>
>({ value: true });
