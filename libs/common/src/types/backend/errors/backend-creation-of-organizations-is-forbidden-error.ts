import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendCreationOfOrganizationsIsForbiddenError = {
  code: 'BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN';
};

export let zBackendCreationOfOrganizationsIsForbiddenError = z.object({
  code: z.literal('BACKEND_CREATION_OF_ORGANIZATIONS_IS_FORBIDDEN')
});

assertTypesEqual<
  BackendCreationOfOrganizationsIsForbiddenError,
  z.infer<typeof zBackendCreationOfOrganizationsIsForbiddenError>
>({ value: true });
