import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type DashboardUnit = {
  type: 'dashboardUnit';
  id: string;
  dashboardId: string;
  draft: boolean;
  title: string;
  filePath?: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  author?: string;
  canEditOrDeleteDashboard: boolean;
  isFavorite: boolean;
  spaceFullTitle: string;
};
export let zDashboardUnit = z
  .object({
    type: z.literal('dashboardUnit'),
    id: z.string(),
    dashboardId: z.string(),
    draft: z.boolean(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    author: z.string().nullish(),
    canEditOrDeleteDashboard: z.boolean(),
    isFavorite: z.boolean(),
    spaceFullTitle: z.string()
  })
  .meta({ id: 'DashboardUnit' });

assertTypesEqual<DashboardUnit, z.infer<typeof zDashboardUnit>>({
  value: true
});
