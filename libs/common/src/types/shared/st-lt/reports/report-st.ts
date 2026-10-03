import type { MconfigChart } from '#common/types/blockml/parts/mconfig-chart';
import type { ReportField } from '#common/types/blockml/parts/report-field';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type ReportSt = {
  filePath: string;
  space?: string;
  accessRoles: string[];
  accessRolesCombined: AccessRoleCombined[];
  title: string;
  fields: ReportField[];
  chart: MconfigChart;
};
