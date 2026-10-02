import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendEnvProdCannotBeDeletedError = {
  code: 'BACKEND_ENV_PROD_CANNOT_BE_DELETED';
};

export let zBackendEnvProdCannotBeDeletedError = z.object({
  code: z.literal('BACKEND_ENV_PROD_CANNOT_BE_DELETED')
});

assertTypesEqual<
  BackendEnvProdCannotBeDeletedError,
  z.infer<typeof zBackendEnvProdCannotBeDeletedError>
>({ value: true });
