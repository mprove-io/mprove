import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskDeleteDevRepoResponse } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response';
import { processResponse } from '#disk/functions/process-response';
import { DeleteDevRepoService } from './delete-dev-repo.service';

@Controller()
export class DeleteDevRepoController {
  constructor(
    private deleteDevRepoService: DeleteDevRepoService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskDeleteDevRepo)
  async deleteDevRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteDevRepoResponse> {
    let response: ToDiskDeleteDevRepoResponse = await processResponse({
      name: 'ToDiskDeleteDevRepo',
      body: body,
      method: request.method,
      process: input => this.deleteDevRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
