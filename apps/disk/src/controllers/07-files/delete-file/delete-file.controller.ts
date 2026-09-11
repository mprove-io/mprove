import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskDeleteFileResponse } from '#common/zod/to-disk/07-files/delete-file/delete-file-response';
import { processResponse } from '#disk/functions/process-response';
import { DeleteFileService } from './delete-file.service';

@Controller()
export class DeleteFileController {
  constructor(
    private deleteFileService: DeleteFileService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskDeleteFile)
  async deleteFile(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskDeleteFileResponse> {
    let response: ToDiskDeleteFileResponse = await processResponse({
      name: 'ToDiskDeleteFile',
      body: body,
      method: request.method,
      process: input => this.deleteFileService.process(input),
      logger: this.logger
    });

    return response;
  }
}
