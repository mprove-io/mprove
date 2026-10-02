import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/types/backend/env';
import { type Member, zMember } from '#common/types/backend/member';

export type ToBackendCreateEnvUserOutput = {
  userMember: Member;
  envs: Env[];
};

export let zToBackendCreateEnvUserOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendCreateEnvUserOutput' });

assertTypesEqual<
  ToBackendCreateEnvUserOutput,
  z.infer<typeof zToBackendCreateEnvUserOutput>
>({ value: true });
