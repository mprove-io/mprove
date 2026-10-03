import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type FieldAny,
  zFieldAny
} from '#common/types/blockml/parts/internal/field-any';
import {
  type FileBasic,
  zFileBasic
} from '#common/types/blockml/parts/internal/file-basic';
import {
  type FileChartOptions,
  zFileChartOptions
} from '#common/types/blockml/parts/internal/file-chart-options';
import {
  type FileReportRow,
  zFileReportRow
} from '#common/types/blockml/parts/internal/file-report-row';
import type { Extend } from '#common/types/extend';
import {
  type AccessRoleCombined,
  zAccessRoleCombined
} from '#common/types/shared/access-role-combined';

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

export let zFileReport = zFileBasic
  .extend({
    report: z.string().nullish(),
    report_line_num: z.number().nullish(),
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    space: z.string().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
    accessRolesCombined: z.array(zAccessRoleCombined).nullish(),
    rows: z.array(zFileReportRow).nullish(),
    rows_line_num: z.number().nullish(),
    options: zFileChartOptions.nullish(),
    options_line_num: z.number().nullish(),
    parameters: z.array(zFieldAny).nullish(),
    parameters_line_num: z.number().nullish(),
    fields: z.array(zFieldAny).nullish(),
    fields_line_num: z.number().nullish(),
    tiles: z
      .array(
        z.object({
          options: zFileChartOptions.nullish()
        })
      )
      .nullish()
  })
  .meta({ id: 'FileReport' });

assertTypesEqual<FileReport, z.infer<typeof zFileReport>>({ value: true });
