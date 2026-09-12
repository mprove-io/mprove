import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskRevertRepoToRemoteResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-remote/revert-repo-to-remote-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { RevertRepoToRemoteService } from './revert-repo-to-remote.service';

@Controller()
export class RevertRepoToRemoteController {
  constructor(
    private revertRepoToRemoteService: RevertRepoToRemoteService,
    private logger: Logger
  ) {}

  @Post('revertRepoToRemote')
  async revertRepoToRemote(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskRevertRepoToRemoteResponse> {
    let response: ToDiskRevertRepoToRemoteResponse = await handleHttpRequest({
      operation: 'revertRepoToRemote',
      body: body,
      method: request.method,
      process: input => this.revertRepoToRemoteService.process(input),
      logger: this.logger
    });

    return response;
  }
}
