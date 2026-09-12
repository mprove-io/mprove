import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskDeleteFolderResponse } from '#common/zod/to-disk/06-folders/delete-folder/delete-folder-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { DeleteFolderService } from './delete-folder.service';

@Controller()
export class DeleteFolderController {
  constructor(
    private deleteFolderService: DeleteFolderService,
    private logger: Logger
  ) {}

  @Post('deleteFolder')
  async deleteFolder(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteFolderResponse> {
    let response: ToDiskDeleteFolderResponse = await handleHttpRequest({
      operation: 'deleteFolder',
      body: body,
      method: request.method,
      process: input => this.deleteFolderService.process(input),
      logger: this.logger
    });

    return response;
  }
}
