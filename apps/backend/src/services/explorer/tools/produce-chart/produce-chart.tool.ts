import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { makeExplorerToolError } from '#backend/functions/make-explorer-tool-error/make-explorer-tool-error';
import {
  CHART_ID_PLACEHOLDER,
  ProduceExplorerChartService
} from '#backend/services/explorer/tools/produce-chart/produce-explorer-chart/produce-explorer-chart.service';
import type { ToBackendProduceExplorerChartOutput } from '#common/types/backend/routes/charts/produce-explorer-chart/produce-explorer-chart-output';

@Injectable()
export class ProduceChartToolService {
  constructor(
    private produceExplorerChartService: ProduceExplorerChartService
  ) {}

  makeTool(item: { user: UserTab; traceId: string; sessionId: string }): Tool {
    let { user, traceId, sessionId } = item;

    let chartTool: Tool = tool({
      description: `Create a chart from YAML and persist it as a session-scoped tab. 
Use ${CHART_ID_PLACEHOLDER} as the YAML top-level chart value. This tool replaces it with a generated chart id. 
The YAML is compiled immediately. If errors are returned, FIX the YAML and call this tool again until it succeeds.`,
      inputSchema: z.object({
        modelId: z.string().describe('The model the chart selects from.'),
        title: z
          .string()
          .describe('Human-readable chart title. Shown to the user.'),
        chartYaml: z
          .string()
          .describe(
            `The full chart YAML text. Must contain ${CHART_ID_PLACEHOLDER} as the chart id placeholder.`
          )
      }),
      execute: async (input): Promise<ToBackendProduceExplorerChartOutput> => {
        let result = await Result.pipe(
          Result.succeed({
            user: user,
            traceId: traceId,
            sessionId: sessionId,
            modelId: input.modelId,
            chartYaml: input.chartYaml,
            title: input.title
          }),
          Result.andThen(v =>
            this.produceExplorerChartService.produceExplorerChart({
              user: v.user,
              traceId: v.traceId,
              sessionId: v.sessionId,
              modelId: v.modelId,
              chartYaml: v.chartYaml,
              title: v.title
            })
          )
        );

        if (Result.isFailure(result)) {
          throw makeExplorerToolError({ error: result.error });
        }

        let output: ToBackendProduceExplorerChartOutput = result.value;

        return output;
      }
    });

    return chartTool;
  }
}
