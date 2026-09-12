import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskIsOrgExistResponse } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { IsOrgExistService } from './is-org-exist.service';

@Controller()
export class IsOrgExistController {
  constructor(
    private isOrgExistService: IsOrgExistService,
    private logger: Logger
  ) {}

  @Post('isOrgExist')
  async isOrgExist(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskIsOrgExistResponse> {
    let response: ToDiskIsOrgExistResponse = await handleHttpRequest({
      operation: 'isOrgExist',
      body: body,
      method: request.method,
      process: input => this.isOrgExistService.process(input),
      logger: this.logger
    });

    return response;
  }
}
