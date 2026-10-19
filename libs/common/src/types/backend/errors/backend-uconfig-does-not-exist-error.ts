import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendUconfigDoesNotExistError = {
  code: 'BACKEND_UCONFIG_DOES_NOT_EXIST';
};

export let zBackendUconfigDoesNotExistError = z.object({
  code: z.literal('BACKEND_UCONFIG_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendUconfigDoesNotExistError,
  z.infer<typeof zBackendUconfigDoesNotExistError>
>({ value: true });
