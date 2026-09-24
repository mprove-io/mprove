import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskDeleteBranchResponse } from '#common/zod/disk/routes/branches/delete-branch/delete-branch-response';
import { handleHttpRequest } from '#disk/functions/top/handle-http-request/handle-http-request';
import { DeleteBranchService } from './delete-branch.service';

@Controller()
export class DeleteBranchController {
  constructor(
    private deleteBranchService: DeleteBranchService,
    private logger: Logger
  ) {}

  @Post('deleteBranch')
  async deleteBranch(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteBranchResponse> {
    let response: ToDiskDeleteBranchResponse = await handleHttpRequest({
      operation: 'deleteBranch',
      body: body,
      method: request.method,
      process: input => this.deleteBranchService.process(input),
      logger: this.logger
    });

    return response;
  }
}
