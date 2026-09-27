import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteEnvUserError,
  zToBackendDeleteEnvUserError
} from './delete-env-user-error';

export type ToBackendDeleteEnvUserOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendDeleteEnvUserResponse = ToBackendResponse<
  ToBackendDeleteEnvUserOutput,
  ToBackendDeleteEnvUserError
>;

export let zToBackendDeleteEnvUserOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvUserOutput' });

export let zToBackendDeleteEnvUserResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteEnvUserOutput,
  error: zToBackendDeleteEnvUserError
}).meta({ id: 'ToBackendDeleteEnvUserResponse' });

assertTypesEqual<
  ToBackendDeleteEnvUserOutput,
  z.infer<typeof zToBackendDeleteEnvUserOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteEnvUserResponse,
  z.infer<typeof zToBackendDeleteEnvUserResponse>
>({ value: true });
