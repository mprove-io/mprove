import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/types/backend/env';
import { type Member, zMember } from '#common/types/backend/member';

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
