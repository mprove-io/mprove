import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveValidationError,
  zMproveValidationError
} from '#common/types/backend/state/mprove-validation-error';
import {
  type StateChartItem,
  zStateChartItem
} from '#common/types/backend/state/state-chart-item';
import {
  type StateDashboardItem,
  zStateDashboardItem
} from '#common/types/backend/state/state-dashboard-item';
import {
  type StateMetricItem,
  zStateMetricItem
} from '#common/types/backend/state/state-metric-item';
import {
  type StateModelItem,
  zStateModelItem
} from '#common/types/backend/state/state-model-item';
import {
  type StateReportItem,
  zStateReportItem
} from '#common/types/backend/state/state-report-item';
import { type Repo, zRepo } from '#common/types/disk/repo';

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

assertTypesEqual<
  ToBackendGetStateOutput,
  z.infer<typeof zToBackendGetStateOutput>
>({ value: true });
