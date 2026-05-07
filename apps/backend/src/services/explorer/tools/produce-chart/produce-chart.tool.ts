import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import {
  CHART_ID_PLACEHOLDER,
  ProduceExplorerChartService
} from './produce-explorer-chart.service';

@Injectable()
export class ProduceChartToolService {
  constructor(
    private produceExplorerChartService: ProduceExplorerChartService
  ) {}

  makeTool(item: { user: UserTab; traceId: string; sessionId: string }): Tool {
    let { user, traceId, sessionId } = item;

    return tool({
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
      execute: async input => {
        let result =
          await this.produceExplorerChartService.produceExplorerChart({
            user: user,
            traceId: traceId,
            sessionId: sessionId,
            modelId: input.modelId,
            chartYaml: input.chartYaml,
            title: input.title
          });

        return result;
      }
    });
  }
}
