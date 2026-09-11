import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskCreateFolderResponse } from '#common/zod/to-disk/06-folders/create-folder/create-folder-response';
import { processResponse } from '#disk/functions/process-response';
import { CreateFolderService } from './create-folder.service';

@Controller()
export class CreateFolderController {
  constructor(
    private createFolderService: CreateFolderService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskCreateFolder)
  async createFolder(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateFolderResponse> {
    let response: ToDiskCreateFolderResponse = await processResponse({
      name: 'ToDiskCreateFolder',
      body: body,
      method: request.method,
      process: input => this.createFolderService.process(input),
      logger: this.logger
    });

    return response;
  }
}
