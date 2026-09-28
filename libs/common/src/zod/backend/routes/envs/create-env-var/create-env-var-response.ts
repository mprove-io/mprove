import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateEnvVarOutput,
  zToBackendCreateEnvVarOutput
} from '#common/zod/backend/routes/envs/create-env-var/create-env-var-output';
import {
  type ToBackendCreateEnvVarError,
  zToBackendCreateEnvVarError
} from './create-env-var-error';

export type ToBackendCreateEnvVarResponse = ToBackendResponseBase<
  'createEnvVar',
  ToBackendCreateEnvVarOutput,
  ToBackendCreateEnvVarError
>;

export let zToBackendCreateEnvVarResponse = makeToBackendResponseSchema({
  operation: 'createEnvVar',
  output: zToBackendCreateEnvVarOutput,
  error: zToBackendCreateEnvVarError
}).meta({ id: 'ToBackendCreateEnvVarResponse' });

assertTypesEqual<
  ToBackendCreateEnvVarResponse,
  z.infer<typeof zToBackendCreateEnvVarResponse>
>({ value: true });
