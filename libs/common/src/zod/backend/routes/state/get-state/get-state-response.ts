import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type MproveValidationError,
  zMproveValidationError
} from '#common/zod/backend/state/mprove-validation-error';
import {
  type StateChartItem,
  zStateChartItem
} from '#common/zod/backend/state/state-chart-item';
import {
  type StateDashboardItem,
  zStateDashboardItem
} from '#common/zod/backend/state/state-dashboard-item';
import {
  type StateMetricItem,
  zStateMetricItem
} from '#common/zod/backend/state/state-metric-item';
import {
  type StateModelItem,
  zStateModelItem
} from '#common/zod/backend/state/state-model-item';
import {
  type StateReportItem,
  zStateReportItem
} from '#common/zod/backend/state/state-report-item';
import { type Repo, zRepo } from '#common/zod/disk/repo';
import {
  type ToBackendGetStateError,
  zToBackendGetStateError
} from './get-state-error';

export type ToBackendGetStateOutput = {
  needValidate: boolean;
  structId: string;
  validationErrorsTotal: number;
  modelsTotal: number;
  chartsTotal: number;
  dashboardsTotal: number;
  reportsTotal: number;
  builderUrl: string;
  validationErrors: MproveValidationError[];
  modelItems: StateModelItem[];
  chartItems: StateChartItem[];
  dashboardItems: StateDashboardItem[];
  reportItems: StateReportItem[];
  metricItems: StateMetricItem[];
  repo?: Repo;
};

export type ToBackendGetStateResponse = ToBackendResponse<
  ToBackendGetStateOutput,
  ToBackendGetStateError
>;

export let zToBackendGetStateOutput = z
  .object({
    needValidate: z.boolean(),
    structId: z.string(),
    validationErrorsTotal: z.number(),
    modelsTotal: z.number(),
    chartsTotal: z.number(),
    dashboardsTotal: z.number(),
    reportsTotal: z.number(),
    builderUrl: z.string(),
    validationErrors: z.array(zMproveValidationError),
    modelItems: z.array(zStateModelItem),
    chartItems: z.array(zStateChartItem),
    dashboardItems: z.array(zStateDashboardItem),
    reportItems: z.array(zStateReportItem),
    metricItems: z.array(zStateMetricItem),
    repo: zRepo.nullish()
  })
  .meta({ id: 'ToBackendGetStateOutput' });

export let zToBackendGetStateResponse = makeToBackendResponseSchema({
  success: zToBackendGetStateOutput,
  error: zToBackendGetStateError
}).meta({ id: 'ToBackendGetStateResponse' });

assertTypesEqual<
  ToBackendGetStateOutput,
  z.infer<typeof zToBackendGetStateOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetStateResponse,
  z.infer<typeof zToBackendGetStateResponse>
>({ value: true });
