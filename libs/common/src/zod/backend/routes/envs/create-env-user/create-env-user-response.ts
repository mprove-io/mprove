import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendCreateEnvUserOutput,
  zToBackendCreateEnvUserOutput
} from '#common/zod/backend/routes/envs/create-env-user/create-env-user-output';
import {
  type ToBackendCreateEnvUserError,
  zToBackendCreateEnvUserError
} from './create-env-user-error';

export type ToBackendCreateEnvUserResponse = ToBackendResponseBase<
  'createEnvUser',
  ToBackendCreateEnvUserOutput,
  ToBackendCreateEnvUserError
>;

export let zToBackendCreateEnvUserResponse = makeToBackendResponseSchema({
  operation: 'createEnvUser',
  output: zToBackendCreateEnvUserOutput,
  error: zToBackendCreateEnvUserError
}).meta({ id: 'ToBackendCreateEnvUserResponse' });

assertTypesEqual<
  ToBackendCreateEnvUserResponse,
  z.infer<typeof zToBackendCreateEnvUserResponse>
>({ value: true });
