import { Injectable } from '@nestjs/common';
import type { Tool } from 'ai';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { GenerateChartIdToolService } from './tools/generate-chart-id.tool';
import { GetModelToolService } from './tools/get-model.tool';
import { GetStateToolService } from './tools/get-state.tool';
import { ListDocsToolService } from './tools/list-docs.tool';
import { ProduceChartToolService } from './tools/produce-chart/produce-chart.tool';
import { ReadDocsToolService } from './tools/read-docs.tool';

@Injectable()
export class ExplorerToolsService {
  constructor(
    private getStateToolService: GetStateToolService,
    private getModelToolService: GetModelToolService,
    private listDocsToolService: ListDocsToolService,
    private readDocsToolService: ReadDocsToolService,
    private generateChartIdToolService: GenerateChartIdToolService,
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
      list_docs: this.listDocsToolService.makeTool(),
      read_docs: this.readDocsToolService.makeTool(),
      get_state: this.getStateToolService.makeTool({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        user: user,
        traceId: traceId
      }),
      get_model: this.getModelToolService.makeTool({
        projectId: projectId,
        repoId: repoId,
        branchId: branchId,
        envId: envId,
        user: user
      }),
      generate_chart_id: this.generateChartIdToolService.makeTool(),
      produce_chart: this.produceChartToolService.makeTool({
        user: user,
        sessionId: sessionId,
        traceId: traceId
      })
    };
  }
}
