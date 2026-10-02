import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetEnvsOutput,
  zToBackendGetEnvsOutput
} from '#common/types/backend/routes/envs/get-envs/get-envs-output';
import {
  type ToBackendGetEnvsError,
  zToBackendGetEnvsError
} from './get-envs-error';

export type ToBackendGetEnvsResponse = ToBackendResponseBase<
  'getEnvs',
  ToBackendGetEnvsOutput,
  ToBackendGetEnvsError
>;

export let zToBackendGetEnvsResponse = makeToBackendResponseSchema({
  operation: 'getEnvs',
  output: zToBackendGetEnvsOutput,
  error: zToBackendGetEnvsError
}).meta({ id: 'ToBackendGetEnvsResponse' });

assertTypesEqual<
  ToBackendGetEnvsResponse,
  z.infer<typeof zToBackendGetEnvsResponse>
>({ value: true });
