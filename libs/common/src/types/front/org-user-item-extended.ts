import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OrgUsersItem,
  zOrgUsersItem
} from '#common/types/backend/parts/org-users/org-users-item';
import type { Extend } from '#common/types/extend';

export type OrgUserItemExtended = Extend<OrgUsersItem, { initials: string }>;

export let zOrgUserItemExtended = zOrgUsersItem
  .extend({
    initials: z.string()
  })
  .meta({ id: 'OrgUserItemExtended' });

assertTypesEqual<OrgUserItemExtended, z.infer<typeof zOrgUserItemExtended>>({
  value: true
});
