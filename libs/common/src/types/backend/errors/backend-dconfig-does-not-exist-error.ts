import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendDconfigDoesNotExistError = {
  code: 'BACKEND_DCONFIG_DOES_NOT_EXIST';
};

export let zBackendDconfigDoesNotExistError = z.object({
  code: z.literal('BACKEND_DCONFIG_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendDconfigDoesNotExistError,
  z.infer<typeof zBackendDconfigDoesNotExistError>
>({ value: true });
