import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendOrgAlreadyExistsError = {
  code: 'BACKEND_ORG_ALREADY_EXISTS';
};

export let zBackendOrgAlreadyExistsError = z.object({
  code: z.literal('BACKEND_ORG_ALREADY_EXISTS')
});

assertTypesEqual<
  BackendOrgAlreadyExistsError,
  z.infer<typeof zBackendOrgAlreadyExistsError>
>({ value: true });
