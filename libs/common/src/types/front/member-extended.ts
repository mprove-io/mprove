import { z } from 'zod';
import { zMember } from '#common/types/backend/parts/member';

export let zMemberExtended = zMember
  .extend({
    initials: z.string()
  })
  .meta({ id: 'MemberExtended' });

export type MemberExtended = z.infer<typeof zMemberExtended>;
