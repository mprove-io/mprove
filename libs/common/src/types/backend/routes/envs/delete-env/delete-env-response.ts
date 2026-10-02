import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteEnvOutput,
  zToBackendDeleteEnvOutput
} from '#common/types/backend/routes/envs/delete-env/delete-env-output';
import {
  type ToBackendDeleteEnvError,
  zToBackendDeleteEnvError
} from './delete-env-error';

export type ToBackendDeleteEnvResponse = ToBackendResponseBase<
  'deleteEnv',
  ToBackendDeleteEnvOutput,
  ToBackendDeleteEnvError
>;

export let zToBackendDeleteEnvResponse = makeToBackendResponseSchema({
  operation: 'deleteEnv',
  output: zToBackendDeleteEnvOutput,
  error: zToBackendDeleteEnvError
}).meta({ id: 'ToBackendDeleteEnvResponse' });

assertTypesEqual<
  ToBackendDeleteEnvResponse,
  z.infer<typeof zToBackendDeleteEnvResponse>
>({ value: true });
