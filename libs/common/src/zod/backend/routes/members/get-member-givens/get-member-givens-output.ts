import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MemberGiven,
  zMemberGiven
} from '#common/zod/backend/members/member-given';

export type ToBackendGetMemberGivensOutput = {
  memberGivens: MemberGiven[];
};

export let zToBackendGetMemberGivensOutput = z
  .object({
    memberGivens: z.array(zMemberGiven)
  })
  .meta({ id: 'ToBackendGetMemberGivensOutput' });

assertTypesEqual<
  ToBackendGetMemberGivensOutput,
  z.infer<typeof zToBackendGetMemberGivensOutput>
>({ value: true });
