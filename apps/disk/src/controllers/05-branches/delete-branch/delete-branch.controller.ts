import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskDeleteBranchResponse } from '#common/zod/to-disk/05-branches/delete-branch/delete-branch-response';
import { processResponse } from '#disk/functions/process-response';
import { DeleteBranchService } from './delete-branch.service';

@Controller()
export class DeleteBranchController {
  constructor(
    private deleteBranchService: DeleteBranchService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskDeleteBranch)
  async deleteBranch(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteBranchResponse> {
    let response: ToDiskDeleteBranchResponse = await processResponse({
      name: 'ToDiskDeleteBranch',
      body: body,
      method: request.method,
      process: input => this.deleteBranchService.process(input),
      logger: this.logger
    });

    return response;
  }
}
