import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskSyncRepoResponse } from '#common/zod/to-disk/03-repos/sync-repo/sync-repo-response';
import { processResponse } from '#disk/functions/process-response';
import { SyncRepoService } from './sync-repo.service';

@Controller()
export class SyncRepoController {
  constructor(
    private syncRepoService: SyncRepoService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskSyncRepo)
  async syncRepo(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskSyncRepoResponse> {
    let response: ToDiskSyncRepoResponse = await processResponse({
      name: 'ToDiskSyncRepo',
      body: body,
      method: request.method,
      process: input => this.syncRepoService.process(input),
      logger: this.logger
    });

    return response;
  }
}
