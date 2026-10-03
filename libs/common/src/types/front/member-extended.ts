import type { Member } from '#common/types/backend/parts/member';
import type { Extend } from '#common/types/extend';

export type MemberExtended = Extend<Member, { initials: string }>;
