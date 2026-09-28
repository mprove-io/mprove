import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetEnvsListOutput,
  zToBackendGetEnvsListOutput
} from '#common/zod/backend/routes/envs/get-envs-list/get-envs-list-output';
import {
  type ToBackendGetEnvsListError,
  zToBackendGetEnvsListError
} from './get-envs-list-error';

export type ToBackendGetEnvsListResponse = ToBackendResponseBase<
  'getEnvsList',
  ToBackendGetEnvsListOutput,
  ToBackendGetEnvsListError
>;

export let zToBackendGetEnvsListResponse = makeToBackendResponseSchema({
  operation: 'getEnvsList',
  output: zToBackendGetEnvsListOutput,
  error: zToBackendGetEnvsListError
}).meta({ id: 'ToBackendGetEnvsListResponse' });

assertTypesEqual<
  ToBackendGetEnvsListResponse,
  z.infer<typeof zToBackendGetEnvsListResponse>
>({ value: true });
