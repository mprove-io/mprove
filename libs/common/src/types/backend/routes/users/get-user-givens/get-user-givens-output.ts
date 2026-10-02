import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MemberGiven,
  zMemberGiven
} from '#common/types/backend/members/member-given';
import { type User, zUser } from '#common/types/backend/user';

export type ToBackendGetUserGivensOutput = {
  user: User;
  memberGivens: MemberGiven[];
};

export let zToBackendGetUserGivensOutput = z
  .object({
    user: zUser,
    memberGivens: z.array(zMemberGiven)
  })
  .meta({ id: 'ToBackendGetUserGivensOutput' });

assertTypesEqual<
  ToBackendGetUserGivensOutput,
  z.infer<typeof zToBackendGetUserGivensOutput>
>({ value: true });
