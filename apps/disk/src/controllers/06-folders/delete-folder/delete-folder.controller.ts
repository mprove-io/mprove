import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskDeleteFolderResponse } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-response';
import { processResponse } from '#disk/functions/process-response';
import { DeleteFolderService } from './delete-folder.service';

@Controller()
export class DeleteFolderController {
  constructor(
    private deleteFolderService: DeleteFolderService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskDeleteFolder)
  async deleteFolder(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteFolderResponse> {
    let response: ToDiskDeleteFolderResponse = await processResponse({
      name: 'ToDiskDeleteFolder',
      body: body,
      method: request.method,
      process: input => this.deleteFolderService.process(input),
      logger: this.logger
    });

    return response;
  }
}
