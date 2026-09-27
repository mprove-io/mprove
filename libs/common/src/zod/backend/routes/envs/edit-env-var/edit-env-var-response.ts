import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditEnvVarError,
  zToBackendEditEnvVarError
} from './edit-env-var-error';

export type ToBackendEditEnvVarOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendEditEnvVarResponse = ToBackendResponse<
  ToBackendEditEnvVarOutput,
  ToBackendEditEnvVarError
>;

export let zToBackendEditEnvVarOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendEditEnvVarOutput' });

export let zToBackendEditEnvVarResponse = makeToBackendResponseSchema({
  success: zToBackendEditEnvVarOutput,
  error: zToBackendEditEnvVarError
}).meta({ id: 'ToBackendEditEnvVarResponse' });

assertTypesEqual<
  ToBackendEditEnvVarOutput,
  z.infer<typeof zToBackendEditEnvVarOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditEnvVarResponse,
  z.infer<typeof zToBackendEditEnvVarResponse>
>({ value: true });
