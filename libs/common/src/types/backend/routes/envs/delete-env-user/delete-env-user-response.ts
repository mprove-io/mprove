import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteEnvUserOutput,
  zToBackendDeleteEnvUserOutput
} from '#common/types/backend/routes/envs/delete-env-user/delete-env-user-output';
import {
  type ToBackendDeleteEnvUserError,
  zToBackendDeleteEnvUserError
} from './delete-env-user-error';

export type ToBackendDeleteEnvUserResponse = ToBackendResponseBase<
  'deleteEnvUser',
  ToBackendDeleteEnvUserOutput,
  ToBackendDeleteEnvUserError
>;

export let zToBackendDeleteEnvUserResponse = makeToBackendResponseSchema({
  operation: 'deleteEnvUser',
  output: zToBackendDeleteEnvUserOutput,
  error: zToBackendDeleteEnvUserError
}).meta({ id: 'ToBackendDeleteEnvUserResponse' });

assertTypesEqual<
  ToBackendDeleteEnvUserResponse,
  z.infer<typeof zToBackendDeleteEnvUserResponse>
>({ value: true });
