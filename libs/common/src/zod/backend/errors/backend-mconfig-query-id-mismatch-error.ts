import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendMconfigQueryIdMismatchError = {
  code: 'BACKEND_MCONFIG_QUERY_ID_MISMATCH';
};

export let zBackendMconfigQueryIdMismatchError = z.object({
  code: z.literal('BACKEND_MCONFIG_QUERY_ID_MISMATCH')
});

assertTypesEqual<
  BackendMconfigQueryIdMismatchError,
  z.infer<typeof zBackendMconfigQueryIdMismatchError>
>({ value: true });
