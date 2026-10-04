import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { TimeSpec } from '#common/types/shared/time/timespec';
import { zTimeSpec } from '#common/types/shared/time/timespec';
import { zTimezone } from '#common/types/shared/timezone/z-timezone';

export type ToBackendGetQueryInfoRequest = {
  operation: 'getQueryInfo';
  traceId: string;
  idempotencyKey: string;
  input: {
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
    timeSpec?: TimeSpec;
    timeRangeFractionBrick?: string;
    getMalloy: boolean;
    getSql: boolean;
    getData: boolean;
    isFetch: boolean;
  };
};

export let zToBackendGetQueryInfoRequest = z
  .strictObject({
    operation: z.literal('getQueryInfo'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
        timeSpec: zTimeSpec.nullish(),
        timeRangeFractionBrick: z.string().nullish(),
        getMalloy: z.boolean(),
        getSql: z.boolean(),
        getData: z.boolean(),
        isFetch: z.boolean()
      })
      .meta({ id: 'ToBackendGetQueryInfoInput' })
  })
  .meta({ id: 'ToBackendGetQueryInfoRequest' });

assertTypesEqual<
  ToBackendGetQueryInfoRequest,
  z.infer<typeof zToBackendGetQueryInfoRequest>
>({ value: true });
