import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskCreateFolderResponse } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { CreateFolderService } from './create-folder.service';

@Controller()
export class CreateFolderController {
  constructor(
    private createFolderService: CreateFolderService,
    private logger: Logger
  ) {}

  @Post('createFolder')
  async createFolder(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateFolderResponse> {
    let response: ToDiskCreateFolderResponse = await handleHttpRequest({
      operation: 'createFolder',
      body: body,
      method: request.method,
      process: input => this.createFolderService.process(input),
      logger: this.logger
    });

    return response;
  }
}
