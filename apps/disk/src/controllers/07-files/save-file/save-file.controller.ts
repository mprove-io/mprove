import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskSaveFileResponse } from '#common/zod/to-disk/07-files/save-file/save-file-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { SaveFileService } from './save-file.service';

@Controller()
export class SaveFileController {
  constructor(
    private saveFileService: SaveFileService,
    private logger: Logger
  ) {}

  @Post('saveFile')
  async saveFile(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskSaveFileResponse> {
    let response: ToDiskSaveFileResponse = await handleHttpRequest({
      operation: 'saveFile',
      body: body,
      method: request.method,
      process: input => this.saveFileService.process(input),
      logger: this.logger
    });

    return response;
  }
}
