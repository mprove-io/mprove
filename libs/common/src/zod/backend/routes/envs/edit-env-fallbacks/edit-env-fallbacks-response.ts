import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendEditEnvFallbacksOutput,
  zToBackendEditEnvFallbacksOutput
} from '#common/zod/backend/routes/envs/edit-env-fallbacks/edit-env-fallbacks-output';
import {
  type ToBackendEditEnvFallbacksError,
  zToBackendEditEnvFallbacksError
} from './edit-env-fallbacks-error';

export type ToBackendEditEnvFallbacksResponse = ToBackendResponseBase<
  'editEnvFallbacks',
  ToBackendEditEnvFallbacksOutput,
  ToBackendEditEnvFallbacksError
>;

export let zToBackendEditEnvFallbacksResponse = makeToBackendResponseSchema({
  operation: 'editEnvFallbacks',
  output: zToBackendEditEnvFallbacksOutput,
  error: zToBackendEditEnvFallbacksError
}).meta({ id: 'ToBackendEditEnvFallbacksResponse' });

assertTypesEqual<
  ToBackendEditEnvFallbacksResponse,
  z.infer<typeof zToBackendEditEnvFallbacksResponse>
>({ value: true });
