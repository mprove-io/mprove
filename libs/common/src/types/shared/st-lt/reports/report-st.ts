import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/types/blockml/parts/mconfig-chart';
import {
  type ReportField,
  zReportField
} from '#common/types/blockml/parts/report-field';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

export type ReportSt = {
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  title: string;
  fields: ReportField[];
  chart: MconfigChart;
};

export let zReportSt = z
  .object({
    filePath: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    accessRolesCombined: z.array(zAccessRoleCombined),
    title: z.string(),
    fields: z.array(zReportField),
    chart: zMconfigChart
  })
  .meta({ id: 'ReportSt' });

assertTypesEqual<ReportSt, z.infer<typeof zReportSt>>({ value: true });
