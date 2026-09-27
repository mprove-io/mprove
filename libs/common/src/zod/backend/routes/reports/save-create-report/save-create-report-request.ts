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

export type ToBackendSaveCreateReportInput = {
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
  newReportFields: ReportField[];
  chart: MconfigChart;
};

export type ToBackendSaveCreateReportRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSaveCreateReportInput;
};

export let zToBackendSaveCreateReportInput = z
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
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFractionBrick: z.string(),
    newReportFields: z.array(zReportField),
    chart: zMconfigChart
  })
  .meta({ id: 'ToBackendSaveCreateReportInput' });

export let zToBackendSaveCreateReportRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSaveCreateReportInput
  })
  .meta({ id: 'ToBackendSaveCreateReportRequest' });

assertTypesEqual<
  ToBackendSaveCreateReportInput,
  z.infer<typeof zToBackendSaveCreateReportInput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveCreateReportRequest,
  z.infer<typeof zToBackendSaveCreateReportRequest>
>({ value: true });
