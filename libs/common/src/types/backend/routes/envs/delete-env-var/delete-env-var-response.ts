import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteEnvVarOutput,
  zToBackendDeleteEnvVarOutput
} from '#common/types/backend/routes/envs/delete-env-var/delete-env-var-output';
import {
  type ToBackendDeleteEnvVarError,
  zToBackendDeleteEnvVarError
} from './delete-env-var-error';

export type ToBackendDeleteEnvVarResponse = ToBackendResponseBase<
  'deleteEnvVar',
  ToBackendDeleteEnvVarOutput,
  ToBackendDeleteEnvVarError
>;

export let zToBackendDeleteEnvVarResponse = makeToBackendResponseSchema({
  operation: 'deleteEnvVar',
  output: zToBackendDeleteEnvVarOutput,
  error: zToBackendDeleteEnvVarError
}).meta({ id: 'ToBackendDeleteEnvVarResponse' });

assertTypesEqual<
  ToBackendDeleteEnvVarResponse,
  z.infer<typeof zToBackendDeleteEnvVarResponse>
>({ value: true });
