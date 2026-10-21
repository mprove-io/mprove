import { UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import type { BackendConfig } from '#backend/config/backend-config';
import { ValidateFilesService } from '#backend/controllers/files/validate-files/validate-files.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
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
import {
  type McpToolValidateFilesOutput,
  zMcpToolValidateFilesOutput
} from '#common/types/backend/mcp-tools/mcp-tool-validate-files/mcp-tool-validate-files-output';
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
  ): Promise<McpToolValidateFilesOutput> {
    let result = await Result.pipe(
      Result.succeed({
        projectId: item.projectId,
        repoId: item.repoId,
        branchId: item.branchId,
        envId: item.envId,
        user: (request as any).user as UserTab,
        apiKeyType: (request as any).apiKeyType as ApiKeyType,
        request: request
      }),
      Result.andThrough(v =>
        v.apiKeyType === 'PK'
          ? this.toolService.validateUserRepoId({
              repoId: v.repoId,
              userId: v.user.userId
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.apiKeyType === 'SK'
          ? this.toolService.validateSessionRepoId({
              repoId: v.repoId,
              request: v.request
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.apiKeyType === 'SK'
          ? this.toolService.validateSessionBranchId({
              branchId: v.branchId,
              request: v.request
            })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.apiKeyType === 'SK'
          ? this.toolService.validateSessionEnvId({
              envId: v.envId,
              request: v.request
            })
          : Result.succeed()
      ),
      Result.bind('validation', v =>
        this.validateFilesService.validateFiles({
          projectId: v.projectId,
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          traceId: makeId(),
          userId: v.user.userId
        })
      ),
      Result.map((v): McpToolValidateFilesOutput => {
        let hostUrl: string = this.cs
          .get<BackendConfig['hostUrl']>('hostUrl')
          .split(',')[0];

        let output: McpToolValidateFilesOutput = processValidateFilesPayload({
          payload: v.validation,
          host: hostUrl,
          projectId: v.projectId,
          branch: v.branchId,
          env: v.envId
        });

        return output;
      })
    );

    let output: McpToolValidateFilesOutput = makeMcpToolResponse({
      result: result
    });

    return output;
  }
}
