import { Injectable } from '@nestjs/common';
import type { Tool } from 'ai';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { GetModelsToolService } from './tools/get-models.tool';
import { ProduceChartToolService } from './tools/produce-chart/produce-chart.tool';
import { ReadDocsToolService } from './tools/read-docs.tool';
import { SearchCachedUniqueValuesToolService } from './tools/search-cached-unique-values.tool';

@Injectable()
export class ExplorerToolsService {
  constructor(
    private getModelsToolService: GetModelsToolService,
    private readDocsToolService: ReadDocsToolService,
    private searchCachedUniqueValuesToolService: SearchCachedUniqueValuesToolService,
    private produceChartToolService: ProduceChartToolService
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
      search_cached_unique_values:
        this.searchCachedUniqueValuesToolService.makeTool({
          projectId: projectId,
          repoId: repoId,
          branchId: branchId,
          envId: envId,
          user: user
        }),
      get_models: this.getModelsToolService.makeTool({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        traceId: traceId,
        user: user
      }),
      read_docs: this.readDocsToolService.makeTool(),
      produce_chart: this.produceChartToolService.makeTool({
        user: user,
        sessionId: sessionId,
        traceId: traceId
      })
    };
  }
}
