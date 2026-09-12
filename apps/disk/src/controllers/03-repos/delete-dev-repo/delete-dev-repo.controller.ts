import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskDeleteDevRepoResponse } from '#common/zod/to-disk/03-repos/delete-dev-repo/delete-dev-repo-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { DeleteDevRepoService } from './delete-dev-repo.service';

@Controller()
export class DeleteDevRepoController {
  constructor(
    private deleteDevRepoService: DeleteDevRepoService,
    private logger: Logger
  ) {}

  @Post('deleteDevRepo')
  async deleteDevRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteDevRepoResponse> {
    let response: ToDiskDeleteDevRepoResponse = await handleHttpRequest({
      operation: 'deleteDevRepo',
      body: body,
      method: request.method,
      process: input => this.deleteDevRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
