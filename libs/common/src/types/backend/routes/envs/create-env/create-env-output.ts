import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/types/backend/env';
import { type Member, zMember } from '#common/types/backend/member';

export type ToBackendCreateEnvOutput = {
  userMember: Member;
  envs: Env[];
};

export let zToBackendCreateEnvOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvOutput' });

assertTypesEqual<
  ToBackendCreateEnvOutput,
  z.infer<typeof zToBackendCreateEnvOutput>
>({ value: true });
