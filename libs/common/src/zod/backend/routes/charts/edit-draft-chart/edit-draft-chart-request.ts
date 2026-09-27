import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type MconfigX, zMconfigX } from '#common/zod/backend/mconfig-x';
import {
  type QueryOperation,
  zQueryOperation
} from '#common/zod/backend/query-operation';

export type ToBackendEditDraftChartInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  chartId: string;
  mconfig: MconfigX;
  queryOperation?: QueryOperation;
};

export type ToBackendEditDraftChartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendEditDraftChartInput;
};

export let zToBackendEditDraftChartInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    chartId: z.string(),
    mconfig: zMconfigX,
    queryOperation: zQueryOperation.nullish()
  })
  .meta({ id: 'ToBackendEditDraftChartInput' });

export let zToBackendEditDraftChartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendEditDraftChartInput
  })
  .meta({ id: 'ToBackendEditDraftChartRequest' });

assertTypesEqual<
  ToBackendEditDraftChartInput,
  z.infer<typeof zToBackendEditDraftChartInput>
>({ value: true });

assertTypesEqual<
  ToBackendEditDraftChartRequest,
  z.infer<typeof zToBackendEditDraftChartRequest>
>({ value: true });
