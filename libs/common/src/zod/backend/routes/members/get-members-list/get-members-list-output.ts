import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type EnvUser, zEnvUser } from '#common/zod/backend/env-user';
import { type Member, zMember } from '#common/zod/backend/member';

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
