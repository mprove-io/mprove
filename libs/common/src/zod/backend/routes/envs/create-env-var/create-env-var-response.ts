import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateEnvVarError,
  zToBackendCreateEnvVarError
} from './create-env-var-error';

export type ToBackendCreateEnvVarOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendCreateEnvVarResponse = ToBackendResponse<
  ToBackendCreateEnvVarOutput,
  ToBackendCreateEnvVarError
>;

export let zToBackendCreateEnvVarOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvVarOutput' });

export let zToBackendCreateEnvVarResponse = makeToBackendResponseSchema({
  success: zToBackendCreateEnvVarOutput,
  error: zToBackendCreateEnvVarError
}).meta({ id: 'ToBackendCreateEnvVarResponse' });

assertTypesEqual<
  ToBackendCreateEnvVarOutput,
  z.infer<typeof zToBackendCreateEnvVarOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEnvVarResponse,
  z.infer<typeof zToBackendCreateEnvVarResponse>
>({ value: true });
