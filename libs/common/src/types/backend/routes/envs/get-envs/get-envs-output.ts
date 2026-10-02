import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Env, zEnv } from '#common/types/backend/parts/env';
import { type Member, zMember } from '#common/types/backend/parts/member';

export type ToBackendGetEnvsOutput = {
  userMember: Member;
  envs: Env[];
};

export let zToBackendGetEnvsOutput = z
  .object({
    userMember: zMember,
    envs: z.array(zEnv)
  })
  .meta({ id: 'ToBackendGetEnvsOutput' });

assertTypesEqual<
  ToBackendGetEnvsOutput,
  z.infer<typeof zToBackendGetEnvsOutput>
>({ value: true });
