import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import type { Extend } from '#common/types/extend';

export type MemberExtended = Extend<Member, { initials: string }>;

export let zMemberExtended = zMember
  .extend({
    initials: z.string()
  })
  .meta({ id: 'MemberExtended' });

assertTypesEqual<MemberExtended, z.infer<typeof zMemberExtended>>({
  value: true
});
