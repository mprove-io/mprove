import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/types/backend/env';
import { type Member, zMember } from '#common/types/backend/member';

export type ToBackendCreateEnvVarOutput = {
  userMember: Member;
  envs: Env[];
};

export let zToBackendCreateEnvVarOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvVarOutput' });

assertTypesEqual<
  ToBackendCreateEnvVarOutput,
  z.infer<typeof zToBackendCreateEnvVarOutput>
>({ value: true });
