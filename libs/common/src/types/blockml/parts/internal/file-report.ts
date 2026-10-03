import type { FieldAny } from '#common/types/blockml/parts/internal/field-any';
import type { FileBasic } from '#common/types/blockml/parts/internal/file-basic';
import type { FileChartOptions } from '#common/types/blockml/parts/internal/file-chart-options';
import type { FileReportRow } from '#common/types/blockml/parts/internal/file-report-row';
import type { Extend } from '#common/types/extend';
import type { AccessRoleCombined } from '#common/types/shared/access-role-combined';

export type FileReport = Extend<
  FileBasic,
  {
    report?: string;
    report_line_num?: number;
    title?: string;
    title_line_num?: number;
    space?: string;
    access_roles?: string[];
    access_roles_line_num?: number;
    accessRolesCombined?: AccessRoleCombined[];
    rows?: FileReportRow[];
    rows_line_num?: number;
    options?: FileChartOptions;
    options_line_num?: number;
    parameters?: FieldAny[];
    parameters_line_num?: number;
    fields?: FieldAny[];
    fields_line_num?: number;
    tiles?: { options?: FileChartOptions }[];
  }
>;
