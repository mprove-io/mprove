import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/zod/backend/env';
import { type Member, zMember } from '#common/zod/backend/member';

export type ToBackendDeleteEnvUserOutput = {
  userMember: Member;
  envs: Env[];
};

export let zToBackendDeleteEnvUserOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendDeleteEnvUserOutput' });

assertTypesEqual<
  ToBackendDeleteEnvUserOutput,
  z.infer<typeof zToBackendDeleteEnvUserOutput>
>({ value: true });
