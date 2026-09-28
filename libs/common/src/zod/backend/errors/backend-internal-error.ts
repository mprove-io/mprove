import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendInternalError = {
  code: 'BACKEND_INTERNAL';
};

export let zBackendInternalError = z.object({
  code: z.literal('BACKEND_INTERNAL')
});

assertTypesEqual<BackendInternalError, z.infer<typeof zBackendInternalError>>({
  value: true
});
