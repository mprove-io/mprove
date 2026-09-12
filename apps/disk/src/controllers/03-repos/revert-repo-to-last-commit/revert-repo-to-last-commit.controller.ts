import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskRevertRepoToLastCommitResponse } from '#common/zod/to-disk/03-repos/revert-repo-to-last-commit/revert-repo-to-last-commit-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { RevertRepoToLastCommitService } from './revert-repo-to-last-commit.service';

@Controller()
export class RevertRepoToLastCommitController {
  constructor(
    private revertRepoToLastCommitService: RevertRepoToLastCommitService,
    private logger: Logger
  ) {}

  @Post('revertRepoToLastCommit')
  async revertRepoToLastCommit(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskRevertRepoToLastCommitResponse> {
    let response: ToDiskRevertRepoToLastCommitResponse =
      await handleHttpRequest({
        operation: 'revertRepoToLastCommit',
        body: body,
        method: request.method,
        process: input => this.revertRepoToLastCommitService.process(input),
        logger: this.logger
      });

    return response;
  }
}
