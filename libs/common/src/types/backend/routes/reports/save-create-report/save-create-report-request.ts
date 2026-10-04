import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/types/blockml/parts/mconfig/mconfig-chart';
import {
  type ReportField,
  zReportField
} from '#common/types/blockml/parts/report/report-field';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { zTimeSpec } from '#common/types/shared/time/timespec';
import { zTimezone } from '#common/types/shared/timezone/z-timezone';

export type ToBackendSaveCreateReportRequest = {
  operation: 'saveCreateReport';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fromReportId: string;
    newReportId: string;
    title: string;
    space?: string;
    accessRoles: string[];
    timezone: string;
    timeSpec: TimeSpec;
    timeRangeFractionBrick: string;
    newReportFields: ReportField[];
    chart: MconfigChart;
  };
};

export let zToBackendSaveCreateReportRequest = z
  .strictObject({
    operation: z.literal('saveCreateReport'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fromReportId: z.string(),
        newReportId: z.string(),
        title: z.string(),
        space: z.string().nullish(),
        accessRoles: z.array(z.string()),
        timezone: zTimezone,
        timeSpec: zTimeSpec,
        timeRangeFractionBrick: z.string(),
        newReportFields: z.array(zReportField),
        chart: zMconfigChart
      })
      .meta({ id: 'ToBackendSaveCreateReportInput' })
  })
  .meta({ id: 'ToBackendSaveCreateReportRequest' });

assertTypesEqual<
  ToBackendSaveCreateReportRequest,
  z.infer<typeof zToBackendSaveCreateReportRequest>
>({ value: true });
