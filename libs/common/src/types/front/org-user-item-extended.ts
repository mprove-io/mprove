import { z } from 'zod';
import { zOrgUsersItem } from '#common/types/backend/parts/org-users/org-users-item';

export let zOrgUserItemExtended = zOrgUsersItem
  .extend({
    initials: z.string()
  })
  .meta({ id: 'OrgUserItemExtended' });

export type OrgUserItemExtended = z.infer<typeof zOrgUserItemExtended>;
