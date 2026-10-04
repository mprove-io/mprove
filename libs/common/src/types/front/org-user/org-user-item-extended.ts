import type { OrgUsersItem } from '#common/types/backend/parts/org-users/org-users-item';
import type { Extend } from '#common/types/extend';

export type OrgUserItemExtended = Extend<OrgUsersItem, { initials: string }>;
