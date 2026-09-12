import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskSyncRepoResponse } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { SyncRepoService } from './sync-repo.service';

@Controller()
export class SyncRepoController {
  constructor(
    private syncRepoService: SyncRepoService,
    private logger: Logger
  ) {}

  @Post('syncRepo')
  async syncRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskSyncRepoResponse> {
    let response: ToDiskSyncRepoResponse = await handleHttpRequest({
      operation: 'syncRepo',
      body: body,
      method: request.method,
      process: input => this.syncRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
