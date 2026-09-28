import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendOrgDoesNotExistError = {
  code: 'BACKEND_ORG_DOES_NOT_EXIST';
};

export let zBackendOrgDoesNotExistError = z.object({
  code: z.literal('BACKEND_ORG_DOES_NOT_EXIST')
});

assertTypesEqual<
  BackendOrgDoesNotExistError,
  z.infer<typeof zBackendOrgDoesNotExistError>
>({ value: true });
