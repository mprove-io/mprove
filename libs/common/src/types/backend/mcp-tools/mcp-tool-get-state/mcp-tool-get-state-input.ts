import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

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
