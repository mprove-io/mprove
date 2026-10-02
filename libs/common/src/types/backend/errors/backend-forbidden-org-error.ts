import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendForbiddenOrgError = {
  code: 'BACKEND_FORBIDDEN_ORG';
};

export let zBackendForbiddenOrgError = z.object({
  code: z.literal('BACKEND_FORBIDDEN_ORG')
});

assertTypesEqual<
  BackendForbiddenOrgError,
  z.infer<typeof zBackendForbiddenOrgError>
>({ value: true });
