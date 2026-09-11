import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskMergeRepoResponse } from '#common/zod/to-disk/03-repos/merge-repo/merge-repo-response';
import { processResponse } from '#disk/functions/process-response';
import { MergeRepoService } from './merge-repo.service';

@Controller()
export class MergeRepoController {
  constructor(
    private mergeRepoService: MergeRepoService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskMergeRepo)
  async mergeRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskMergeRepoResponse> {
    let response: ToDiskMergeRepoResponse = await processResponse({
      name: 'ToDiskMergeRepo',
      body: body,
      method: request.method,
      process: input => this.mergeRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
