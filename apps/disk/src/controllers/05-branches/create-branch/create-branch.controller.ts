import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskCreateBranchResponse } from '#common/zod/to-disk/05-branches/create-branch/create-branch-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { CreateBranchService } from './create-branch.service';

@Controller()
export class CreateBranchController {
  constructor(
    private createBranchService: CreateBranchService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskCreateBranch)
  async createBranch(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateBranchResponse> {
    let response: ToDiskCreateBranchResponse = await handleHttpRequest({
      name: 'ToDiskCreateBranch',
      body: body,
      method: request.method,
      process: input => this.createBranchService.process(input),
      logger: this.logger
    });

    return response;
  }
}
