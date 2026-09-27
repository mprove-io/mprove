import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteEnvVarError,
  zToBackendDeleteEnvVarError
} from './delete-env-var-error';

export type ToBackendDeleteEnvVarOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendDeleteEnvVarResponse = ToBackendResponse<
  ToBackendDeleteEnvVarOutput,
  ToBackendDeleteEnvVarError
>;

export let zToBackendDeleteEnvVarOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvVarOutput' });

export let zToBackendDeleteEnvVarResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteEnvVarOutput,
  error: zToBackendDeleteEnvVarError
}).meta({ id: 'ToBackendDeleteEnvVarResponse' });

assertTypesEqual<
  ToBackendDeleteEnvVarOutput,
  z.infer<typeof zToBackendDeleteEnvVarOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteEnvVarResponse,
  z.infer<typeof zToBackendDeleteEnvVarResponse>
>({ value: true });
