import { z } from 'zod';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendGetQueryInfoInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  chartId?: string;
  dashboardId?: string;
  tileIndex?: number;
  reportId?: string;
  rowId?: string;
  timezone: string;
  timeSpec?:
    | TimeSpecEnum.Timestamps
    | TimeSpecEnum.Seconds
    | TimeSpecEnum.Minutes
    | TimeSpecEnum.Hours
    | TimeSpecEnum.Days
    | TimeSpecEnum.Weeks
    | TimeSpecEnum.Months
    | TimeSpecEnum.Quarters
    | TimeSpecEnum.Years;
  timeRangeFractionBrick?: string;
  getMalloy: boolean;
  getSql: boolean;
  getData: boolean;
  isFetch: boolean;
};

export type ToBackendGetQueryInfoRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendGetQueryInfoInput;
};

export let zToBackendGetQueryInfoInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string().nullish(),
    dashboardId: z.string().nullish(),
    tileIndex: z.number().nullish(),
    reportId: z.string().nullish(),
    rowId: z.string().nullish(),
    timezone: zTimezone,
    timeSpec: z.enum(TimeSpecEnum).nullish(),
    timeRangeFractionBrick: z.string().nullish(),
    getMalloy: z.boolean(),
    getSql: z.boolean(),
    getData: z.boolean(),
    isFetch: z.boolean()
  })
  .meta({ id: 'ToBackendGetQueryInfoInput' });

export let zToBackendGetQueryInfoRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendGetQueryInfoInput
  })
  .meta({ id: 'ToBackendGetQueryInfoRequest' });

assertTypesEqual<
  ToBackendGetQueryInfoInput,
  z.infer<typeof zToBackendGetQueryInfoInput>
>({ value: true });

assertTypesEqual<
  ToBackendGetQueryInfoRequest,
  z.infer<typeof zToBackendGetQueryInfoRequest>
>({ value: true });
