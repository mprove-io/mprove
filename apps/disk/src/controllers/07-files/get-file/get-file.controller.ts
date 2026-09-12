import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskGetFileResponse } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { GetFileService } from './get-file.service';

@Controller()
export class GetFileController {
  constructor(
    private getFileService: GetFileService,
    private logger: Logger
  ) {}

  @Post('getFile')
  async getFile(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskGetFileResponse> {
    let response: ToDiskGetFileResponse = await handleHttpRequest({
      operation: 'getFile',
      body: body,
      method: request.method,
      process: input => this.getFileService.process(input),
      logger: this.logger
    });

    return response;
  }
}
