import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendCreateEnvError,
  zToBackendCreateEnvError
} from './create-env-error';

export type ToBackendCreateEnvOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendCreateEnvResponse = ToBackendResponse<
  ToBackendCreateEnvOutput,
  ToBackendCreateEnvError
>;

export let zToBackendCreateEnvOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvOutput' });

export let zToBackendCreateEnvResponse = makeToBackendResponseSchema({
  success: zToBackendCreateEnvOutput,
  error: zToBackendCreateEnvError
}).meta({ id: 'ToBackendCreateEnvResponse' });

assertTypesEqual<
  ToBackendCreateEnvOutput,
  z.infer<typeof zToBackendCreateEnvOutput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateEnvResponse,
  z.infer<typeof zToBackendCreateEnvResponse>
>({ value: true });
