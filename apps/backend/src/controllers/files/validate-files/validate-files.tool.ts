import { Injectable, UseFilters } from '@nestjs/common';
import type { Context } from '@rekog/mcp-nest';
import { Tool } from '@rekog/mcp-nest';
import type { Request } from 'express';
import { z } from 'zod';
import { ValidateFilesService } from '#backend/controllers/files/validate-files/validate-files.service';
import type { UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { McpExceptionFilter } from '#backend/filters/mcp-exception.filter';
import { ToolService } from '#backend/services/tool.service';
import { ApiKeyTypeEnum } from '#common/enums/api-key-type.enum';
import { makeId } from '#common/functions/make-id';

@Injectable()
@UseFilters(McpExceptionFilter)
export class ValidateFilesTool {
  constructor(
    private validateFilesService: ValidateFilesService,
    private toolService: ToolService
  ) {}

  @Tool({
    name: 'validate-files',
    description:
      'Validate (rebuild) Mprove files for a project branch and environment',
    parameters: z.object({
      projectId: z.string(),
      repoId: z.string(),
      branchId: z.string(),
      envId: z.string()
    }),
    outputSchema: z.object({
      needValidate: z.boolean(),
      errorsTotal: z.number(),
      errors: z.array(
        z.object({
          title: z.string(),
          message: z.string()
        })
      )
    })
  })
  async validateFiles(
    item: {
      projectId: string;
      repoId: string;
      branchId: string;
      envId: string;
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

    let traceId = makeId();

    let result = await this.validateFilesService.validateFiles({
      traceId: traceId,
      userId: user.userId,
      projectId: item.projectId,
      repoId: item.repoId,
      branchId: item.branchId,
      envId: item.envId
    });

    return {
      needValidate: result.needValidate,
      errorsTotal: result.struct.errors.length,
      errors: result.struct.errors.map(e => ({
        title: e.title,
        message: e.message
      }))
    };
  }
}
