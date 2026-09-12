import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskCommitRepoResponse } from '#common/zod/to-disk/03-repos/commit-repo/commit-repo-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { CommitRepoService } from './commit-repo.service';

@Controller()
export class CommitRepoController {
  constructor(
    private commitRepoService: CommitRepoService,
    private logger: Logger
  ) {}

  @Post('commitRepo')
  async commitRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCommitRepoResponse> {
    let response: ToDiskCommitRepoResponse = await handleHttpRequest({
      operation: 'commitRepo',
      body: body,
      method: request.method,
      process: input => this.commitRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
