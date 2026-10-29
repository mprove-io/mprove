import { UseFilters } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '@nestjs/microservices';
import { Result } from '@praha/byethrow';
import { McpController, McpRawRequest, Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import type { BackendConfig } from '#backend/config/backend-config';
import { ValidateFilesService } from '#backend/controllers/files/validate-files/validate-files.service';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { McpExceptionFilter } from '#backend/filters/mcp-exception/mcp-exception.filter';
import { makeMcpOutputSchema } from '#backend/functions/make-mcp-output-schema/make-mcp-output-schema';
import { makeMcpToolResponse } from '#backend/functions/make-mcp-tool-response/make-mcp-tool-response';
import { validateMcpRepoBranchEnvAccess } from '#backend/functions/validate-mcp/validate-mcp-repo-branch-env-access/validate-mcp-repo-branch-env-access';
import { zodStripMcpSchemaId } from '#backend/functions/zod/zod-strip-mcp-schema-id/zod-strip-mcp-schema-id';
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
import type { McpApiKeyParsed } from '#common/types/backend/parts/api-key/mcp-api-key-parsed';
import { processValidateFilesPayload } from '#node-common/functions/process-validate-files-payload/process-validate-files-payload';

@McpController()
@UseFilters(McpExceptionFilter)
export class ValidateFilesTool {
  constructor(
    private validateFilesService: ValidateFilesService,
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
        apiKeyParsed: (request as any).apiKeyParsed as McpApiKeyParsed
      }),
      Result.andThrough(v =>
        validateMcpRepoBranchEnvAccess({
          repoId: v.repoId,
          branchId: v.branchId,
          envId: v.envId,
          apiKeyParsed: v.apiKeyParsed
        })
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
