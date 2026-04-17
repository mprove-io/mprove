import { z } from 'zod';
import { zOrgUsersItem } from '#common/zod/to-backend/org-users/to-backend-get-org-users';

export let zOrgUserItemExtended = zOrgUsersItem
  .extend({
    initials: z.string()
  })
  .meta({ id: 'OrgUserItemExtended' });

export type OrgUserItemExtended = z.infer<typeof zOrgUserItemExtended>;
