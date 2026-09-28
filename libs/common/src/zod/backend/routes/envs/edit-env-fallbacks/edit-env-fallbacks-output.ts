import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';

export type ToBackendEditEnvFallbacksOutput = {
  userMember: Member;
  envs: Env[];
};

export let zToBackendEditEnvFallbacksOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendEditEnvFallbacksOutput' });

assertTypesEqual<
  ToBackendEditEnvFallbacksOutput,
  z.infer<typeof zToBackendEditEnvFallbacksOutput>
>({ value: true });
