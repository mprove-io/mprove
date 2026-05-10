import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { GetStateService } from '#backend/controllers/state/get-state/get-state.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { MCP_TOOL_GET_STATE } from '#common/constants/top-backend';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';
import { zodDeepNullish } from '#common/functions/zod-deep-nullish';
import {
  type McpToolGetStateInput,
  zMcpToolGetStateInput,
  zMcpToolGetStateOutput
} from '#common/zod/to-backend/state/mcp-tool-get-state';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetStateTool {
  constructor(
    private getStateService: GetStateService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: MCP_TOOL_GET_STATE,
    description:
      'Get project state: models, dashboards, charts, reports, metrics, validation errors, and repo info',
    parameters: zMcpToolGetStateInput,
    outputSchema: zodDeepNullish({ schema: zMcpToolGetStateOutput })
  })
  async getState(
    item: McpToolGetStateInput,
    context: Context,
    request: Request
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyTypeEnum;

    if (apiKeyType === ApiKeyTypeEnum.PK) {
      this.toolService.validateUserRepoId({
        repoId: item.repoId,
        userId: user.userId
      });
    } else if (apiKeyType === ApiKeyTypeEnum.SK) {
      this.toolService.validateSessionProjectId({
        projectId: item.projectId,
        request: request
      });
      this.toolService.validateSessionRepoId({
        repoId: item.repoId,
        request: request
      });
      this.toolService.validateSessionBranchId({
        branchId: item.branchId,
        request: request
      });
      this.toolService.validateSessionEnvId({
        envId: item.envId,
        request: request
      });
    }

    let traceId = makeId();

    return await this.getStateService.getState({
      traceId: traceId,
      user: user,
      projectId: item.projectId,
      repoId: item.repoId,
      branchId: item.branchId,
      envId: item.envId,
      isFetch: item.isFetch,
      getErrors: item.getErrors,
      getRepo: item.getRepo,
      getRepoNodes: item.getRepoNodes,
      getModels: item.getModels,
      getDashboards: item.getDashboards,
      getCharts: item.getCharts,
      getMetrics: item.getMetrics,
      getReports: item.getReports
    });
  }
}
