import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendEditEnvVarOutput,
  zToBackendEditEnvVarOutput
} from '#common/types/backend/routes/envs/edit-env-var/edit-env-var-output';
import {
  type ToBackendEditEnvVarError,
  zToBackendEditEnvVarError
} from './edit-env-var-error';

export type ToBackendEditEnvVarResponse = ToBackendResponseBase<
  'editEnvVar',
  ToBackendEditEnvVarOutput,
  ToBackendEditEnvVarError
>;

export let zToBackendEditEnvVarResponse = makeToBackendResponseSchema({
  operation: 'editEnvVar',
  output: zToBackendEditEnvVarOutput,
  error: zToBackendEditEnvVarError
}).meta({ id: 'ToBackendEditEnvVarResponse' });

assertTypesEqual<
  ToBackendEditEnvVarResponse,
  z.infer<typeof zToBackendEditEnvVarResponse>
>({ value: true });
