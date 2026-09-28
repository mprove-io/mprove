import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendForbiddenModelError = {
  code: 'BACKEND_FORBIDDEN_MODEL';
};

export let zBackendForbiddenModelError = z.object({
  code: z.literal('BACKEND_FORBIDDEN_MODEL')
});

assertTypesEqual<
  BackendForbiddenModelError,
  z.infer<typeof zBackendForbiddenModelError>
>({ value: true });
