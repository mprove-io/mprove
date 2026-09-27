import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendGetReportInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  reportId: string;
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
};

export type ToBackendGetReportRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetReportInput;
};

export let zToBackendGetReportInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    reportId: z.string(),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum),
    timeRangeFractionBrick: z.string()
  })
  .meta({ id: 'ToBackendGetReportInput' });

export let zToBackendGetReportRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetReportInput
  })
  .meta({ id: 'ToBackendGetReportRequest' });

assertTypesEqual<
  ToBackendGetReportInput,
  z.infer<typeof zToBackendGetReportInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetReportRequest,
  z.infer<typeof zToBackendGetReportRequest>
>({ value: true });
