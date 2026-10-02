import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { zTimezone } from '#common/types/shared/timezone/z-timezone';

export type ToBackendSaveModifyChartRequest = {
  operation: 'saveModifyChart';
  traceId: string;
  idempotencyKey: string;
  input: {
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
};

export let zToBackendSaveModifyChartRequest = z
  .strictObject({
    operation: z.literal('saveModifyChart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
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
      .meta({ id: 'ToBackendSaveModifyChartInput' })
  })
  .meta({ id: 'ToBackendSaveModifyChartRequest' });

assertTypesEqual<
  ToBackendSaveModifyChartRequest,
  z.infer<typeof zToBackendSaveModifyChartRequest>
>({ value: true });
