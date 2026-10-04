import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { GivenType } from '#common/types/backend/parts/given/given-type';
import { zGivenType } from '#common/types/backend/parts/given/given-type';
import {
  type MemberGivenValue,
  zMemberGivenValue
} from '#common/types/backend/parts/members/member-given-value';

export type MemberGiven = {
  givenId: string;
  type: GivenType;
  isMultiple: boolean;
  memberGivenValues: MemberGivenValue[];
};

export let zMemberGiven = z
  .object({
    givenId: z.string(),
    type: zGivenType,
    isMultiple: z.boolean(),
    memberGivenValues: z.array(zMemberGivenValue)
  })
  .meta({ id: 'MemberGiven' });

assertTypesEqual<MemberGiven, z.infer<typeof zMemberGiven>>({ value: true });
