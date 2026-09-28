import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';

export type ToBackendDeleteEnvVarOutput = {
  userMember: Member;
  envs: Env[];
};

export let zToBackendDeleteEnvVarOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvVarOutput' });

assertTypesEqual<
  ToBackendDeleteEnvVarOutput,
  z.infer<typeof zToBackendDeleteEnvVarOutput>
>({ value: true });
