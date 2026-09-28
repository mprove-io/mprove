import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendModelIdIsNotDefinedError = {
  code: 'BACKEND_MODEL_ID_IS_NOT_DEFINED';
};

export let zBackendModelIdIsNotDefinedError = z.object({
  code: z.literal('BACKEND_MODEL_ID_IS_NOT_DEFINED')
});

assertTypesEqual<
  BackendModelIdIsNotDefinedError,
  z.infer<typeof zBackendModelIdIsNotDefinedError>
>({ value: true });
