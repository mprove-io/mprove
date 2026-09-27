import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateEnvUserError,
  zToBackendCreateEnvUserError
} from './create-env-user-error';

export type ToBackendCreateEnvUserOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendCreateEnvUserResponse = ToBackendResponse<
  ToBackendCreateEnvUserOutput,
  ToBackendCreateEnvUserError
>;

export let zToBackendCreateEnvUserOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvUserOutput' });

export let zToBackendCreateEnvUserResponse = makeToBackendResponseSchema({
  success: zToBackendCreateEnvUserOutput,
  error: zToBackendCreateEnvUserError
}).meta({ id: 'ToBackendCreateEnvUserResponse' });

assertTypesEqual<
  ToBackendCreateEnvUserOutput,
  z.infer<typeof zToBackendCreateEnvUserOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEnvUserResponse,
  z.infer<typeof zToBackendCreateEnvUserResponse>
>({ value: true });
