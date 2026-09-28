import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMconfigDoesNotExistError = {
  code: 'BACKEND_MCONFIG_DOES_NOT_EXIST';
};

export let zBackendMconfigDoesNotExistError = z.object({
  code: z.literal('BACKEND_MCONFIG_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendMconfigDoesNotExistError,
  z.infer<typeof zBackendMconfigDoesNotExistError>
>({ value: true });
