import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskIsOrgExistResponse } from '#common/zod/to-disk/01-orgs/is-org-exist/is-org-exist-response';
import { processResponse } from '#disk/functions/process-response';
import { IsOrgExistService } from './is-org-exist.service';

@Controller()
export class IsOrgExistController {
  constructor(
    private isOrgExistService: IsOrgExistService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskIsOrgExist)
  async isOrgExist(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskIsOrgExistResponse> {
    let response: ToDiskIsOrgExistResponse = await processResponse({
      name: 'ToDiskIsOrgExist',
      body: body,
      method: request.method,
      process: input => this.isOrgExistService.process(input),
      logger: this.logger
    });

    return response;
  }
}
