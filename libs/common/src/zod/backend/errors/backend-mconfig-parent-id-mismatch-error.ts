import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMconfigParentIdMismatchError = {
  code: 'BACKEND_MCONFIG_PARENT_ID_MISMATCH';
};

export let zBackendMconfigParentIdMismatchError = z.object({
  code: z.literal('BACKEND_MCONFIG_PARENT_ID_MISMATCH')
});

assertTypesEqual<
  BackendMconfigParentIdMismatchError,
  z.infer<typeof zBackendMconfigParentIdMismatchError>
>({ value: true });
