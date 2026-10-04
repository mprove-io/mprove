import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type ReportUnit = {
  type: 'reportUnit';
  id: string;
  reportId: string;
  title: string;
  filePath?: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  author?: string;
  canEditOrDeleteReport: boolean;
  isFavorite: boolean;
  draft: boolean;
  spaceFullTitle: string;
};

export let zReportUnit = z
  .object({
    type: z.literal('reportUnit'),
    id: z.string(),
    reportId: z.string(),
    title: z.string(),
    filePath: z.string().nullish(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    author: z.string().nullish(),
    canEditOrDeleteReport: z.boolean(),
    isFavorite: z.boolean(),
    draft: z.boolean(),
    spaceFullTitle: z.string()
  })
  .meta({ id: 'ReportUnit' });

assertTypesEqual<ReportUnit, z.infer<typeof zReportUnit>>({ value: true });
