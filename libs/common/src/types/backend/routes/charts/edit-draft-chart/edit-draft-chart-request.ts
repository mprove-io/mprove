import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigX,
  zMconfigX
} from '#common/types/backend/parts/mconfig-x';
import {
  type QueryOperation,
  zQueryOperation
} from '#common/types/backend/parts/query-operation';

export type ToBackendEditDraftChartRequest = {
  operation: 'editDraftChart';
  traceId: string;
  idempotencyKey: string;
  input: {
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    chartId: string;
    mconfig: MconfigX;
    queryOperation?: QueryOperation;
  };
};

export let zToBackendEditDraftChartRequest = z
  .strictObject({
    operation: z.literal('editDraftChart'),
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: z
      .object({
        projectId: z.string(),
        repoId: z.string(),
        branchId: z.string(),
        envId: z.string(),
        chartId: z.string(),
        mconfig: zMconfigX,
        queryOperation: zQueryOperation.nullish()
      })
      .meta({ id: 'ToBackendEditDraftChartInput' })
  })
  .meta({ id: 'ToBackendEditDraftChartRequest' });

assertTypesEqual<
  ToBackendEditDraftChartRequest,
  z.infer<typeof zToBackendEditDraftChartRequest>
>({ value: true });
