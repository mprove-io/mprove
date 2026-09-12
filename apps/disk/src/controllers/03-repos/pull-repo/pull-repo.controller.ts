import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskPullRepoResponse } from '#common/zod/to-disk/03-repos/pull-repo/pull-repo-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { PullRepoService } from './pull-repo.service';

@Controller()
export class PullRepoController {
  constructor(
    private pullRepoService: PullRepoService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskPullRepo)
  async pullRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskPullRepoResponse> {
    let response: ToDiskPullRepoResponse = await handleHttpRequest({
      name: 'ToDiskPullRepo',
      body: body,
      method: request.method,
      process: input => this.pullRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
