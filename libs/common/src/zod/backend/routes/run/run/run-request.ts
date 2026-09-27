import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendRunInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  concurrency?: number;
  wait: boolean;
  sleep?: number;
  dashboardIds?: string;
  chartIds?: string;
  noDashboards: boolean;
  noCharts: boolean;
  getDashboards: boolean;
  getCharts: boolean;
  reportIds?: string;
  noReports: boolean;
  getReports: boolean;
};

export type ToBackendRunRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendRunInput;
};

export let zToBackendRunInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    concurrency: z.number().int().positive().nullish(),
    wait: z.boolean(),
    sleep: z.number().nullish(),
    dashboardIds: z.string().nullish(),
    chartIds: z.string().nullish(),
    noDashboards: z.boolean(),
    noCharts: z.boolean(),
    getDashboards: z.boolean(),
    getCharts: z.boolean(),
    reportIds: z.string().nullish(),
    noReports: z.boolean(),
    getReports: z.boolean()
  })
  .meta({ id: 'ToBackendRunInput' });

export let zToBackendRunRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendRunInput
  })
  .meta({ id: 'ToBackendRunRequest' });

assertTypesEqual<ToBackendRunInput, z.infer<typeof zToBackendRunInput>>({
  value: true
});

assertTypesEqual<ToBackendRunRequest, z.infer<typeof zToBackendRunRequest>>({
  value: true
});
