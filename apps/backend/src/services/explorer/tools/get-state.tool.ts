import { Injectable } from '@nestjs/common';
import { type Tool, tool } from 'ai';
import { z } from 'zod';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';

@Injectable()
export class GetStateToolService {
  constructor(private getStateService: GetStateService) {}

  makeTool(item: {
    traceId: string;
    user: UserTab;
    projectId: string;
    repoId: string;
    branchId: string;
    envId: string;
  }): Tool {
    let { traceId, user, projectId, repoId, branchId, envId } = item;

    return tool({
      description: 'List the project state.',
      inputSchema: z.object({
        getModels: z
          .boolean()
          .nullish()
          .describe('Include the list of available models. Defaults to true.')
        // getCharts: z
        //   .boolean()
        //   .nullish()
        //   .describe('Include the list of saved charts. Defaults to false.'),
        // getDashboards: z
        //   .boolean()
        //   .nullish()
        //   .describe('Include the list of saved dashboards. Defaults to false.')
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
          getDashboards: false,
          getCharts: false,
          getMetrics: false,
          getReports: false
        });

        return {
          structId: payload.structId,
          modelItems: payload.modelItems,
          chartItems: payload.chartItems,
          dashboardItems: payload.dashboardItems,
          modelsTotal: payload.modelsTotal,
          chartsTotal: payload.chartsTotal,
          dashboardsTotal: payload.dashboardsTotal
        };
      }
    });
  }
}
