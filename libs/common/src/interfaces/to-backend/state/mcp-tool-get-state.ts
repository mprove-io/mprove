import { z } from 'zod';
import { zMproveValidationError } from '#common/zod/backend/state/mprove-validation-error';
import { zStateChartItem } from '#common/zod/backend/state/state-chart-item';
import { zStateDashboardItem } from '#common/zod/backend/state/state-dashboard-item';
import { zStateMetricItem } from '#common/zod/backend/state/state-metric-item';
import { zStateModelItem } from '#common/zod/backend/state/state-model-item';
import { zStateRepo } from '#common/zod/backend/state/state-repo';
import { zStateReportItem } from '#common/zod/backend/state/state-report-item';

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
    repo: zStateRepo.optional()
  })
  .meta({ id: 'McpToolGetStateOutput' });

export type McpToolGetStateInput = z.infer<typeof zMcpToolGetStateInput>;

export type McpToolGetStateOutput = z.infer<typeof zMcpToolGetStateOutput>;
