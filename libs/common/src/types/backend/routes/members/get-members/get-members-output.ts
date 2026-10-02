import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/member';
import { type Role, zRole } from '#common/types/backend/role';

export type ToBackendGetMembersOutput = {
  userMember: Member;
  members: Member[];
  roles: Role[];
  total: number;
};

export let zToBackendGetMembersOutput = z
  .object({
    userMember: zMember,
    members: z.array(zMember),
    roles: z.array(zRole),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetMembersOutput' });

assertTypesEqual<
  ToBackendGetMembersOutput,
  z.infer<typeof zToBackendGetMembersOutput>
>({ value: true });
