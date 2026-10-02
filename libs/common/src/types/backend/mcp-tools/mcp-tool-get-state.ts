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
  type StateRepo,
  zStateRepo
} from '#common/types/backend/state/state-repo';
import {
  type StateReportItem,
  zStateReportItem
} from '#common/types/backend/state/state-report-item';

export type McpToolGetStateInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  isFetch: boolean;
  getErrors: boolean;
  getRepo: boolean;
  getRepoNodes: boolean;
  getModels: boolean;
  getDashboards: boolean;
  getCharts: boolean;
  getMetrics: boolean;
  getReports: boolean;
};

export let zMcpToolGetStateInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    repoId: z.string().describe('Repository ID'),
    branchId: z.string().describe('Git branch name'),
    envId: z.string().describe('Environment ID'),
    isFetch: z.boolean().describe('Fetch latest data from the database'),
    getErrors: z.boolean().describe('Include validation errors in output'),
    getRepo: z.boolean().describe('Include repo info in output'),
    getRepoNodes: z.boolean().describe('Include repo file nodes in output'),
    getModels: z.boolean().describe('Include models in output'),
    getDashboards: z.boolean().describe('Include dashboards in output'),
    getCharts: z.boolean().describe('Include charts in output'),
    getMetrics: z.boolean().describe('Include metrics in output'),
    getReports: z.boolean().describe('Include reports in output')
  })
  .meta({ id: 'McpToolGetStateInput' });

assertTypesEqual<McpToolGetStateInput, z.infer<typeof zMcpToolGetStateInput>>({
  value: true
});

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
