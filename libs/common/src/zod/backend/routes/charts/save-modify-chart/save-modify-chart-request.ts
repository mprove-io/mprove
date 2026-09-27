import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/zod/z-timezone';

export type ToBackendSaveModifyChartInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  fromChartId: string;
  chartId: string;
  tileTitle: string;
  space?: string;
  accessRoles: string[];
  timezone: string;
};

export type ToBackendSaveModifyChartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendSaveModifyChartInput;
};

export let zToBackendSaveModifyChartInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    fromChartId: z.string(),
    chartId: z.string(),
    tileTitle: z.string(),
    space: z.string().nullish(),
    accessRoles: z.array(z.string()),
    timezone: zTimezone
  })
  .meta({ id: 'ToBackendSaveModifyChartInput' });

export let zToBackendSaveModifyChartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendSaveModifyChartInput
  })
  .meta({ id: 'ToBackendSaveModifyChartRequest' });

assertTypesEqual<
  ToBackendSaveModifyChartInput,
  z.infer<typeof zToBackendSaveModifyChartInput>
>({ value: true });

assertTypesEqual<
  ToBackendSaveModifyChartRequest,
  z.infer<typeof zToBackendSaveModifyChartRequest>
>({ value: true });
