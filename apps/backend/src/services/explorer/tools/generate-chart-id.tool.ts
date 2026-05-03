import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { makeId } from '#common/functions/make-id';

@Injectable()
export class GenerateChartIdToolService {
  makeTool(): Tool {
    return tool({
      description: `Generate a chart id before creating chart YAML. 
Put this exact id in the YAML top-level chart field and pass it to produce_chart.`,
      inputSchema: z.object({}),
      execute: async () => {
        return { chartId: makeId() };
      }
    });
  }
}
