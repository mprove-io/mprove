import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskIsBranchExistResponse } from '#common/zod/to-disk/05-branches/is-branch-exist/is-branch-exist-response';
import { processResponse } from '#disk/functions/process-response';
import { IsBranchExistService } from './is-branch-exist.service';

@Controller()
export class IsBranchExistController {
  constructor(
    private isBranchExistService: IsBranchExistService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskIsBranchExist)
  async isBranchExist(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskIsBranchExistResponse> {
    let response: ToDiskIsBranchExistResponse = await processResponse({
      name: 'ToDiskIsBranchExist',
      body: body,
      method: request.method,
      process: input => this.isBranchExistService.process(input),
      logger: this.logger
    });

    return response;
  }
}
