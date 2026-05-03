import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { ProduceExplorerChartService } from '#backend/controllers/explorer/produce-explorer-chart/produce-explorer-chart.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class ProduceChartToolService {
  constructor(
    private produceExplorerChartService: ProduceExplorerChartService
  ) {}

  makeTool(item: { user: UserTab; traceId: string; sessionId: string }): Tool {
    let { user, traceId, sessionId } = item;

    return tool({
      description: `Create a chart from YAML and persist it as a session-scoped tab. 
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
    });
  }
}
