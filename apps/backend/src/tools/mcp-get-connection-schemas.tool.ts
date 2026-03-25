import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ConnectionSchemasService } from '#backend/services/connection-schemas.service';
import { PROD_REPO_ID } from '#common/constants/top';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ServerError } from '#common/models/server-error';

@Injectable()
@UseFilters(McpExceptionFilter)
export class McpGetConnectionSchemasTool {
  constructor(private connectionSchemasService: ConnectionSchemasService) {}

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
      if (item.repoId !== user.userId && item.repoId !== PROD_REPO_ID) {
        throw new ServerError({
          message: ErEnum.BACKEND_REPO_ID_DOES_NOT_MATCH_USER
        });
      }
    } else if (apiKeyType === ApiKeyTypeEnum.SK) {
      let sessionId = (request as any).apiKeyToValidateSessionId as string;

      if (item.repoId !== sessionId && item.repoId !== PROD_REPO_ID) {
        throw new ServerError({
          message: ErEnum.BACKEND_REPO_ID_DOES_NOT_MATCH_SESSION
        });
      }
    }

    let result = await this.connectionSchemasService.getConnectionSchemas({
      userId: user.userId,
      projectId: item.projectId,
      envId: item.envId,
      repoId: item.repoId,
      branchId: item.branchId,
      isRefresh: item.isRefresh !== false
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result.combinedSchemaItems)
        }
      ]
    };
  }
}
