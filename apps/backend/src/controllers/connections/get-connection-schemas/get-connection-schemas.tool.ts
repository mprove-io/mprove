import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { GetConnectionSchemasService } from '#backend/controllers/connections/get-connection-schemas/get-connection-schemas.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { zCombinedSchemaItem } from '#common/zod/z-combined-schema-item';

@Injectable()
@UseFilters(McpExceptionFilter)
export class GetConnectionSchemasTool {
  constructor(
    private getConnectionSchemasService: GetConnectionSchemasService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: 'get-connection-schemas',
    description:
      'Fetch database schemas (tables, columns, relationships, indexes) for project connections',
    parameters: z.object({
      projectId: z.string(),
      envId: z.string(),
      repoId: z.string(),
      branchId: z.string(),
      isRefresh: z.boolean()
    }),
    outputSchema: z.object({
      combinedSchemaItems: z.array(zCombinedSchemaItem)
    })
  })
  async getConnectionSchemas(
    item: {
      projectId: string;
      envId: string;
      repoId: string;
      branchId: string;
      isRefresh: boolean;
    },
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

    let result = await this.getConnectionSchemasService.getConnectionSchemas({
      userId: user.userId,
      projectId: item.projectId,
      envId: item.envId,
      repoId: item.repoId,
      branchId: item.branchId,
      isRefresh: item.isRefresh !== false
    });

    return {
      combinedSchemaItems: result.combinedSchemaItems
    };
  }
}
