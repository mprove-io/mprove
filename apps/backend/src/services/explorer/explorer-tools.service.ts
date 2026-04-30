import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { ProduceExplorerChartService } from '#backend/controllers/explorer/produce-explorer-chart/produce-explorer-chart.service';
import { GetModelService } from '#backend/controllers/models/get-model/get-model.service';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { ExplorerDocsService } from '#backend/services/explorer/explorer-docs.service';
import { makeId } from '#common/functions/make-id';

@Injectable()
export class ExplorerToolsService {
  constructor(
    private getStateService: GetStateService,
    private getModelService: GetModelService,
    private produceExplorerChartService: ProduceExplorerChartService,
    private explorerDocsService: ExplorerDocsService
  ) {}

  getTools(item: {
    user: UserTab;
    sessionId: string;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
    traceId: string;
  }): Record<string, Tool> {
    let { user, sessionId, projectId, repoId, branchId, envId, traceId } = item;

    return {
      get_state: tool({
        description:
          'List the project state: validation status and which models, charts, and dashboards are available.',
        inputSchema: z.object({
          getModels: z
            .boolean()
            .nullish()
            .describe(
              'Include the list of available models. Defaults to true.'
            ),
          getCharts: z
            .boolean()
            .nullish()
            .describe('Include the list of saved charts. Defaults to false.'),
          getDashboards: z
            .boolean()
            .nullish()
            .describe(
              'Include the list of saved dashboards. Defaults to false.'
            )
        }),
        execute: async input => {
          let payload = await this.getStateService.getState({
            traceId: traceId,
            user: user,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            isFetch: false,
            getErrors: false,
            getRepo: false,
            getRepoNodes: false,
            getModels: input.getModels !== false,
            getDashboards: input.getDashboards === true,
            getCharts: input.getCharts === true,
            getMetrics: false,
            getReports: false
          });

          return {
            modelItems: payload.modelItems,
            chartItems: payload.chartItems,
            dashboardItems: payload.dashboardItems,
            modelsTotal: payload.modelsTotal,
            chartsTotal: payload.chartsTotal,
            dashboardsTotal: payload.dashboardsTotal
          };
        }
      }),

      get_model: tool({
        description: 'Get model dimensions and measures',
        inputSchema: z.object({
          modelId: z.string().describe('The id (name) of the model to inspect.')
        }),
        execute: async input => {
          let payload = await this.getModelService.getModel({
            userId: user.userId,
            projectId: projectId,
            repoId: repoId,
            branchId: branchId,
            envId: envId,
            modelId: input.modelId,
            getMalloy: false
          });

          return {
            modelId: payload.model.modelId,
            label: payload.model.label,
            fields: payload.model.fields
          };
        }
      }),

      read_docs: tool({
        description: `Read cached Mprove documentation files sourced from https://docs.mprove.io/content/docs/docs-for-ai.mdx. 
Call with no arguments to list all available content/docs MDX files. 
Call with a filePath to read that file. 
Use this to look up chart YAML fields, model syntax, and other Mprove concepts.`,
        inputSchema: z.object({
          filePath: z
            .string()
            .nullish()
            .describe(
              'Path of the MDX file relative to content/docs, e.g. "reference/chart.mdx". Omit to list all files.'
            )
        }),
        execute: async input => {
          let result = await this.explorerDocsService.readDoc({
            filePath: input.filePath
          });

          return result;
        }
      }),

      generate_chart_id: tool({
        description: `Generate a backend chart id before authoring chart YAML. 
Put this exact id in the YAML top-level chart field and pass it to produce_chart.`,
        inputSchema: z.object({}),
        execute: async () => {
          return { chartId: makeId() };
        }
      }),

      produce_chart: tool({
        description: `Author a chart from a YAML and persist it as a session-scoped tab. 
Call generate_chart_id first, use that chartId as the YAML top-level chart value, and pass the same chartId here. 
The YAML is compiled immediately. If errors are returned, FIX the YAML and call this tool again until it succeeds.`,
        inputSchema: z.object({
          chartId: z
            .string()
            .describe(
              'The id returned by generate_chart_id. Must match the top-level chart value in chartYaml.'
            ),
          modelId: z.string().describe('The model the chart selects from.'),
          title: z
            .string()
            .describe('Human-readable chart title. Shown to the user.'),
          chartYaml: z.string().describe('The full chart YAML text.')
        }),
        execute: async input => {
          let result =
            await this.produceExplorerChartService.produceExplorerChart({
              user: user,
              traceId: traceId,
              sessionId: sessionId,
              chartId: input.chartId,
              modelId: input.modelId,
              chartYaml: input.chartYaml,
              title: input.title
            });

          return result;
        }
      })
    };
  }
}
