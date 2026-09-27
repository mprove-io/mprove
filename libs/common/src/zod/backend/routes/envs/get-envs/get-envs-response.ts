import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetEnvsError,
  zToBackendGetEnvsError
} from './get-envs-error';

export type ToBackendGetEnvsOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendGetEnvsResponse = ToBackendResponse<
  ToBackendGetEnvsOutput,
  ToBackendGetEnvsError
>;

export let zToBackendGetEnvsOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendGetEnvsOutput' });

export let zToBackendGetEnvsResponse = makeToBackendResponseSchema({
  success: zToBackendGetEnvsOutput,
  error: zToBackendGetEnvsError
}).meta({ id: 'ToBackendGetEnvsResponse' });

assertTypesEqual<
  ToBackendGetEnvsOutput,
  z.infer<typeof zToBackendGetEnvsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetEnvsResponse,
  z.infer<typeof zToBackendGetEnvsResponse>
>({ value: true });
