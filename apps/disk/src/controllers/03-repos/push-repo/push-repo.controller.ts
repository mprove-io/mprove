import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskPushRepoResponse } from '#common/zod/to-disk/03-repos/push-repo/push-repo-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { PushRepoService } from './push-repo.service';

@Controller()
export class PushRepoController {
  constructor(
    private pushRepoService: PushRepoService,
    private logger: Logger
  ) {}

  @Post('pushRepo')
  async pushRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskPushRepoResponse> {
    let response: ToDiskPushRepoResponse = await handleHttpRequest({
      operation: 'pushRepo',
      body: body,
      method: request.method,
      process: input => this.pushRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
