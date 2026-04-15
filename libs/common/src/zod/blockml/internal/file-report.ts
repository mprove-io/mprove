import { z } from 'zod';
import { zFieldAny } from '#common/zod/blockml/internal/field-any';
import { zFileBasic } from '#common/zod/blockml/internal/file-basic';
import { zFileChartOptions } from '#common/zod/blockml/internal/file-chart-options';
import { zFileReportRow } from '#common/zod/blockml/internal/file-report-row';

export let zFileReport = zFileBasic
  .extend({
    report: z.string().nullish(),
    report_line_num: z.number().nullish(),
    title: z.string().nullish(),
    title_line_num: z.number().nullish(),
    access_roles: z.array(z.string()).nullish(),
    access_roles_line_num: z.number().nullish(),
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

export type FileReport = z.infer<typeof zFileReport>;
