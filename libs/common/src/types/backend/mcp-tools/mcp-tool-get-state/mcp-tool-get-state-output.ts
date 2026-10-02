import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MproveValidationError,
  zMproveValidationError
} from '#common/types/backend/parts/state/mprove-validation-error';
import {
  type StateChartItem,
  zStateChartItem
} from '#common/types/backend/parts/state/state-chart-item';
import {
  type StateDashboardItem,
  zStateDashboardItem
} from '#common/types/backend/parts/state/state-dashboard-item';
import {
  type StateMetricItem,
  zStateMetricItem
} from '#common/types/backend/parts/state/state-metric-item';
import {
  type StateModelItem,
  zStateModelItem
} from '#common/types/backend/parts/state/state-model-item';
import {
  type StateRepo,
  zStateRepo
} from '#common/types/backend/parts/state/state-repo';
import {
  type StateReportItem,
  zStateReportItem
} from '#common/types/backend/parts/state/state-report-item';

export type McpToolGetStateOutput = {
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
  repo?: StateRepo;
};

export let zMcpToolGetStateOutput = z
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
    repo: zStateRepo.nullish()
  })
  .meta({ id: 'McpToolGetStateOutput' });

assertTypesEqual<McpToolGetStateOutput, z.infer<typeof zMcpToolGetStateOutput>>(
  { value: true }
);
