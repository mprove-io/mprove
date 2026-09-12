import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskIsBranchExistResponse } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { IsBranchExistService } from './is-branch-exist.service';

@Controller()
export class IsBranchExistController {
  constructor(
    private isBranchExistService: IsBranchExistService,
    private logger: Logger
  ) {}

  @Post('isBranchExist')
  async isBranchExist(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskIsBranchExistResponse> {
    let response: ToDiskIsBranchExistResponse = await handleHttpRequest({
      operation: 'isBranchExist',
      body: body,
      method: request.method,
      process: input => this.isBranchExistService.process(input),
      logger: this.logger
    });

    return response;
  }
}
