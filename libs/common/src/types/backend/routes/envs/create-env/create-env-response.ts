import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateEnvOutput,
  zToBackendCreateEnvOutput
} from '#common/types/backend/routes/envs/create-env/create-env-output';
import {
  type ToBackendCreateEnvError,
  zToBackendCreateEnvError
} from './create-env-error';

export type ToBackendCreateEnvResponse = ToBackendResponseBase<
  'createEnv',
  ToBackendCreateEnvOutput,
  ToBackendCreateEnvError
>;

export let zToBackendCreateEnvResponse = makeToBackendResponseSchema({
  operation: 'createEnv',
  output: zToBackendCreateEnvOutput,
  error: zToBackendCreateEnvError
}).meta({ id: 'ToBackendCreateEnvResponse' });

assertTypesEqual<
  ToBackendCreateEnvResponse,
  z.infer<typeof zToBackendCreateEnvResponse>
>({ value: true });
