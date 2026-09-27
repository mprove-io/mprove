import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type MemberGivenValue = {
  value: string;
  isProjectDefault: boolean;
  roleIds: string[];
};

export let zMemberGivenValue = z
  .object({
    value: z.string(),
    isProjectDefault: z.boolean(),
    roleIds: z.array(z.string())
  })
  .meta({ id: 'MemberGivenValue' });

assertTypesEqual<MemberGivenValue, z.infer<typeof zMemberGivenValue>>({
  value: true
});
