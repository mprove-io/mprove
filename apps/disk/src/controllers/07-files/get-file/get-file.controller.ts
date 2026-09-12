import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskGetFileResponse } from '#common/zod/to-disk/07-files/get-file/get-file-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { GetFileService } from './get-file.service';

@Controller()
export class GetFileController {
  constructor(
    private getFileService: GetFileService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskGetFile)
  async getFile(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskGetFileResponse> {
    let response: ToDiskGetFileResponse = await handleHttpRequest({
      name: 'ToDiskGetFile',
      body: body,
      method: request.method,
      process: input => this.getFileService.process(input),
      logger: this.logger
    });

    return response;
  }
}
