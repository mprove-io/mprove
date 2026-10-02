import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type MconfigX, zMconfigX } from '#common/types/backend/mconfig-x';

export type ToBackendSaveCreateChartRequest = {
  operation: 'saveCreateChart';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    fromChartId: string;
    newChartId: string;
    tileTitle: string;
    space?: string;
    accessRoles: string[];
    mconfig: MconfigX;
  };
};

export let zToBackendSaveCreateChartRequest = z
  .strictObject({
    operation: z.literal('saveCreateChart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        fromChartId: z.string(),
        newChartId: z.string(),
        tileTitle: z.string(),
        space: z.string().nullish(),
        accessRoles: z.array(z.string()),
        mconfig: zMconfigX
      })
      .meta({ id: 'ToBackendSaveCreateChartInput' })
  })
  .meta({ id: 'ToBackendSaveCreateChartRequest' });

assertTypesEqual<
  ToBackendSaveCreateChartRequest,
  z.infer<typeof zToBackendSaveCreateChartRequest>
>({ value: true });
