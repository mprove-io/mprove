import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OrgUsersItem,
  zOrgUsersItem
} from '#common/zod/backend/org-users/org-users-item';

export type ToBackendGetOrgUsersOutput = {
  orgUsersList: OrgUsersItem[];
  total: number;
};

export let zToBackendGetOrgUsersOutput = z
  .object({
    orgUsersList: z.array(zOrgUsersItem),
    total: z.number()
  })
  .meta({ id: 'ToBackendGetOrgUsersOutput' });

assertTypesEqual<
  ToBackendGetOrgUsersOutput,
  z.infer<typeof zToBackendGetOrgUsersOutput>
>({ value: true });
