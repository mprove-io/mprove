import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/types/shared/timezone/z-timezone';

export type ToBackendGetReportRequest = {
  operation: 'getReport';
  traceId: string;
  idempotencyKey: string;
  input: {
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
};

export let zToBackendGetReportRequest = z
  .strictObject({
    operation: z.literal('getReport'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendGetReportInput' })
  })
  .meta({ id: 'ToBackendGetReportRequest' });

assertTypesEqual<
  ToBackendGetReportRequest,
  z.infer<typeof zToBackendGetReportRequest>
>({ value: true });
