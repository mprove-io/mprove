import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Given, zGiven } from '#common/types/backend/parts/given/given';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type Role, zRole } from '#common/types/backend/parts/role';

export type ToBackendGetRolesOutput = {
  userMember: Member;
  roles: Role[];
  givens: Given[];
};

export let zToBackendGetRolesOutput = z
  .object({
    userMember: zMember,
    roles: z.array(zRole),
    givens: z.array(zGiven)
  })
  .meta({ id: 'ToBackendGetRolesOutput' });

assertTypesEqual<
  ToBackendGetRolesOutput,
  z.infer<typeof zToBackendGetRolesOutput>
>({ value: true });
