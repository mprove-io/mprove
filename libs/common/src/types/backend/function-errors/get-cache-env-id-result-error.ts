import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetApiEnvsResultError,
  zGetApiEnvsResultError
} from '#common/types/backend/function-errors/get-api-envs-result-error';

export type GetCacheEnvIdResultError = GetApiEnvsResultError;

export let zGetCacheEnvIdResultError = zGetApiEnvsResultError;

assertTypesEqual<
  GetCacheEnvIdResultError,
  z.infer<typeof zGetCacheEnvIdResultError>
>({ value: true });
