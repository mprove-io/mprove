import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigChart,
  zMconfigChart
} from '#common/zod/blockml/mconfig-chart';
import {
  type ReportField,
  zReportField
} from '#common/zod/blockml/report-field';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendSaveModifyReportInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  fromReportId: string;
  modReportId: string;
  title: string;
  space?: string;
  accessRoles: string[];
  timezone: string;
  timeSpec:
    | TimeSpecEnum.Timestamps
    | TimeSpecEnum.Seconds
    | TimeSpecEnum.Minutes
    | TimeSpecEnum.Hours
    | TimeSpecEnum.Days
    | TimeSpecEnum.Weeks
    | TimeSpecEnum.Months
    | TimeSpecEnum.Quarters
    | TimeSpecEnum.Years;
  timeRangeFractionBrick: string;
  newReportFields?: ReportField[];
  chart?: MconfigChart;
};

export type ToBackendSaveModifyReportRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSaveModifyReportInput;
};

export let zToBackendSaveModifyReportInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromReportId: z.string(),
    modReportId: z.string(),
    title: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFractionBrick: z.string(),
    newReportFields: z.array(zReportField).nullish(),
    chart: zMconfigChart.nullish()
  })
  .meta({ id: 'ToBackendSaveModifyReportInput' });

export let zToBackendSaveModifyReportRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSaveModifyReportInput
  })
  .meta({ id: 'ToBackendSaveModifyReportRequest' });

assertTypesEqual<
  ToBackendSaveModifyReportInput,
  z.infer<typeof zToBackendSaveModifyReportInput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveModifyReportRequest,
  z.infer<typeof zToBackendSaveModifyReportRequest>
>({ value: true });
