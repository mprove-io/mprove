import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendDeleteEnvError,
  zToBackendDeleteEnvError
} from './delete-env-error';

export type ToBackendDeleteEnvOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendDeleteEnvResponse = ToBackendResponse<
  ToBackendDeleteEnvOutput,
  ToBackendDeleteEnvError
>;

export let zToBackendDeleteEnvOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvOutput' });

export let zToBackendDeleteEnvResponse = makeToBackendResponseSchema({
  success: zToBackendDeleteEnvOutput,
  error: zToBackendDeleteEnvError
}).meta({ id: 'ToBackendDeleteEnvResponse' });

assertTypesEqual<
  ToBackendDeleteEnvOutput,
  z.infer<typeof zToBackendDeleteEnvOutput>
>({ value: true });

assertTypesEqual<
  ToBackendDeleteEnvResponse,
  z.infer<typeof zToBackendDeleteEnvResponse>
>({ value: true });
