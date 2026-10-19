import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendOcSessionDoesNotExistError = {
  code: 'BACKEND_OC_SESSION_DOES_NOT_EXIST';
};

export let zBackendOcSessionDoesNotExistError = z.object({
  code: z.literal('BACKEND_OC_SESSION_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendOcSessionDoesNotExistError,
  z.infer<typeof zBackendOcSessionDoesNotExistError>
>({ value: true });
