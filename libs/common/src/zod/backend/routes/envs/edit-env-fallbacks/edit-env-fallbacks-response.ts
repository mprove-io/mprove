import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendEditEnvFallbacksError,
  zToBackendEditEnvFallbacksError
} from './edit-env-fallbacks-error';

export type ToBackendEditEnvFallbacksOutput = {
  userMember: Member;
  envs: Env[];
};

export type ToBackendEditEnvFallbacksResponse = ToBackendResponse<
  ToBackendEditEnvFallbacksOutput,
  ToBackendEditEnvFallbacksError
>;

export let zToBackendEditEnvFallbacksOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendEditEnvFallbacksOutput' });

export let zToBackendEditEnvFallbacksResponse = makeToBackendResponseSchema({
  success: zToBackendEditEnvFallbacksOutput,
  error: zToBackendEditEnvFallbacksError
}).meta({ id: 'ToBackendEditEnvFallbacksResponse' });

assertTypesEqual<
  ToBackendEditEnvFallbacksOutput,
  z.infer<typeof zToBackendEditEnvFallbacksOutput>
>({ value: true });

assertTypesEqual<
  ToBackendEditEnvFallbacksResponse,
  z.infer<typeof zToBackendEditEnvFallbacksResponse>
>({ value: true });
