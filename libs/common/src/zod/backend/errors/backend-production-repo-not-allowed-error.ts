import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type BackendProductionRepoNotAllowedError = {
  code: 'BACKEND_PRODUCTION_REPO_NOT_ALLOWED';
};

export let zBackendProductionRepoNotAllowedError = z.object({
  code: z.literal('BACKEND_PRODUCTION_REPO_NOT_ALLOWED')
});

assertTypesEqual<
  BackendProductionRepoNotAllowedError,
  z.infer<typeof zBackendProductionRepoNotAllowedError>
>({ value: true });
