import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendOcMessageDoesNotExistError = {
  code: 'BACKEND_OC_MESSAGE_DOES_NOT_EXIST';
};

export let zBackendOcMessageDoesNotExistError = z.object({
  code: z.literal('BACKEND_OC_MESSAGE_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendOcMessageDoesNotExistError,
  z.infer<typeof zBackendOcMessageDoesNotExistError>
>({ value: true });
