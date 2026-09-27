import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type MconfigX, zMconfigX } from '#common/zod/backend/mconfig-x';
import {
  type QueryOperation,
  zQueryOperation
} from '#common/zod/backend/query-operation';

export type ToBackendCreateDraftChartInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  mconfig: MconfigX;
  isKeepQueryId?: boolean;
  cellMetricsStartDateMs?: number;
  cellMetricsEndDateMs?: number;
  queryOperation?: QueryOperation;
};

export type ToBackendCreateDraftChartRequest = {
  traceId: string;
  idempotencyKey: string;
  input: ToBackendCreateDraftChartInput;
};

export let zToBackendCreateDraftChartInput = z
  .object({
    projectId: z.string(),
    repoId: z.string(),
    branchId: z.string(),
    envId: z.string(),
    mconfig: zMconfigX,
    isKeepQueryId: z.boolean().nullish(),
    cellMetricsStartDateMs: z.number().nullish(),
    cellMetricsEndDateMs: z.number().nullish(),
    queryOperation: zQueryOperation.nullish()
  })
  .meta({ id: 'ToBackendCreateDraftChartInput' });

export let zToBackendCreateDraftChartRequest = z
  .strictObject({
    traceId: z.string(),
    idempotencyKey: z.string(),
    input: zToBackendCreateDraftChartInput
  })
  .meta({ id: 'ToBackendCreateDraftChartRequest' });

assertTypesEqual<
  ToBackendCreateDraftChartInput,
  z.infer<typeof zToBackendCreateDraftChartInput>
>({ value: true });

assertTypesEqual<
  ToBackendCreateDraftChartRequest,
  z.infer<typeof zToBackendCreateDraftChartRequest>
>({ value: true });
