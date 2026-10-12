import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetApiEnvsError,
  zGetApiEnvsError
} from '#common/types/backend/function-errors/get-api-envs-error';

export type GetCacheEnvIdError = GetApiEnvsError;

export let zGetCacheEnvIdError = zGetApiEnvsError;

assertTypesEqual<GetCacheEnvIdError, z.infer<typeof zGetCacheEnvIdError>>({
  value: true
});
