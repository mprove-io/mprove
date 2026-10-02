import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type EnvUser, zEnvUser } from '#common/types/backend/parts/env-user';
import { type Member, zMember } from '#common/types/backend/parts/member';

export type ToBackendGetMembersListOutput = {
  userMember: Member;
  membersList: EnvUser[];
};

export let zToBackendGetMembersListOutput = z
  .object({
    userMember: zMember,
    membersList: z.array(zEnvUser)
  })
  .meta({ id: 'ToBackendGetMembersListOutput' });

assertTypesEqual<
  ToBackendGetMembersListOutput,
  z.infer<typeof zToBackendGetMembersListOutput>
>({ value: true });
