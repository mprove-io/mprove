import { z } from 'zod';
import { GivenTypeEnum } from '#common/enums/given-type.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MemberGivenValue,
  zMemberGivenValue
} from '#common/zod/backend/members/member-given-value';

export type MemberGiven = {
  givenId: string;
  type:
    | GivenTypeEnum.String
    | GivenTypeEnum.Number
    | GivenTypeEnum.Boolean
    | GivenTypeEnum.Date
    | GivenTypeEnum.Timestamp;
  isMultiple: boolean;
  memberGivenValues: MemberGivenValue[];
};

export let zMemberGiven = z
  .object({
    givenId: z.string(),
    type: z.enum(GivenTypeEnum),
    isMultiple: z.boolean(),
    memberGivenValues: z.array(zMemberGivenValue)
  })
  .meta({ id: 'MemberGiven' });

assertTypesEqual<MemberGiven, z.infer<typeof zMemberGiven>>({ value: true });
