import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskIsProjectExistResponse } from '#common/zod/disk/routes/projects/is-project-exist/is-project-exist-response';
import { handleHttpRequest } from '#disk/functions/top/handle-http-request/handle-http-request';
import { IsProjectExistService } from './is-project-exist.service';

@Controller()
export class IsProjectExistController {
  constructor(
    private isProjectExistService: IsProjectExistService,
    private logger: Logger
  ) {}

  @Post('isProjectExist')
  async isProjectExist(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskIsProjectExistResponse> {
    let response: ToDiskIsProjectExistResponse = await handleHttpRequest({
      operation: 'isProjectExist',
      body: body,
      method: request.method,
      process: input => this.isProjectExistService.process(input),
      logger: this.logger
    });

    return response;
  }
}
