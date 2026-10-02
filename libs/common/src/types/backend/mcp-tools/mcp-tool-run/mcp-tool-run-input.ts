import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type McpToolRunInput = {
  projectId: string;
  repoId: string;
  branchId: string;
  envId: string;
  concurrency?: number;
  wait: boolean;
  sleep?: number;
  dashboardIds?: string;
  chartIds?: string;
  noDashboards: boolean;
  noCharts: boolean;
  getDashboards: boolean;
  getCharts: boolean;
  reportIds?: string;
  noReports: boolean;
  getReports: boolean;
};

export let zMcpToolRunInput = z
  .object({
    projectId: z.string().describe('Project ID'),
    repoId: z.string().describe('Repository ID'),
    branchId: z.string().describe('Git branch name'),
    envId: z.string().describe('Environment ID'),
    concurrency: z
      .number()
      .nullish()
      .describe('Max concurrent queries. Omit to use server default.'),
    wait: z.boolean().describe('Wait for queries completion'),
    sleep: z
      .number()
      .nullish()
      .describe(
        'Seconds to sleep between query status checks. Omit to use default of 3 seconds.'
      ),
    dashboardIds: z
      .string()
      .nullish()
      .describe(
        'Comma-separated dashboard IDs to run. Omit to run all dashboards.'
      ),
    chartIds: z
      .string()
      .nullish()
      .describe('Comma-separated chart IDs to run. Omit to run all charts.'),
    noDashboards: z.boolean().describe('Do not run dashboards'),
    noCharts: z.boolean().describe('Do not run charts'),
    getDashboards: z.boolean().describe('Include dashboards in output'),
    getCharts: z.boolean().describe('Include charts in output'),
    reportIds: z
      .string()
      .nullish()
      .describe('Comma-separated report IDs to run. Omit to run all reports.'),
    noReports: z.boolean().describe('Do not run reports'),
    getReports: z.boolean().describe('Include reports in output')
  })
  .meta({ id: 'McpToolRunInput' });

assertTypesEqual<McpToolRunInput, z.infer<typeof zMcpToolRunInput>>({
  value: true
});
