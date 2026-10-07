import { UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '@nestjs/microservices';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import type { BackendConfig } from '#backend/config/backend-config';
import { ValidateFilesService } from '#backend/controllers/files/validate-files/validate-files.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
import { ToolService } from '#backend/services/tool/tool.service';
import {
  MCP_TOOL_VALIDATE,
  MCP_TOOL_VALIDATE_DESCRIPTION
} from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';
import {
  type McpToolValidateFilesInput,
  zMcpToolValidateFilesInput
} from '#common/types/backend/mcp-tools/mcp-tool-validate-files/mcp-tool-validate-files-input';
import { zMcpToolValidateFilesOutput } from '#common/types/backend/mcp-tools/mcp-tool-validate-files/mcp-tool-validate-files-output';
import type { ApiKeyType } from '#common/types/backend/parts/api-key/api-key-type';
import { processValidateFilesPayload } from '#node-common/functions/process-validate-files-payload/process-validate-files-payload';

@McpController()
@UseFilters(McpExceptionFilter)
export class ValidateFilesTool {
  constructor(
    private validateFilesService: ValidateFilesService,
    private toolService: ToolService,
    private cs: ConfigService<BackendConfig>
  ) {}

  @Tool({
    name: MCP_TOOL_VALIDATE,
    description: MCP_TOOL_VALIDATE_DESCRIPTION,
    parameters: zodStripMcpSchemaId({ schema: zMcpToolValidateFilesInput }),
    outputSchema: makeMcpOutputSchema({
      schema: zMcpToolValidateFilesOutput
    })
  })
  async validateFiles(
    @Payload() item: McpToolValidateFilesInput,
    @McpRawRequest() request: Request
  ) {
    let user = (request as any).user as UserTab;

    let apiKeyType = (request as any).apiKeyType as ApiKeyType;

    if (apiKeyType === 'PK') {
      this.toolService.validateUserRepoId({
        repoId: item.repoId,
        userId: user.userId
      });
    } else if (apiKeyType === 'SK') {
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

    let result = await this.validateFilesService.validateFiles({
      traceId: traceId,
      userId: user.userId,
      projectId: item.projectId,
      repoId: item.repoId,
      branchId: item.branchId,
      envId: item.envId
    });

    let hostUrl = this.cs
      .get<BackendConfig['hostUrl']>('hostUrl')
      .split(',')[0];

    return processValidateFilesPayload({
      payload: result,
      host: hostUrl,
      projectId: item.projectId,
      branch: item.branchId,
      env: item.envId
    });
  }
}
