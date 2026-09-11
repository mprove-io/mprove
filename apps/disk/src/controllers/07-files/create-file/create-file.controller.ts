import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskCreateFileResponse } from '#common/zod/to-disk/07-files/create-file/create-file-response';
import { processResponse } from '#disk/functions/process-response';
import { CreateFileService } from './create-file.service';

@Controller()
export class CreateFileController {
  constructor(
    private createFileService: CreateFileService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskCreateFile)
  async createFile(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskCreateFileResponse> {
    let response: ToDiskCreateFileResponse = await processResponse({
      name: 'ToDiskCreateFile',
      body: body,
      method: request.method,
      process: input => this.createFileService.process(input),
      logger: this.logger
    });

    return response;
  }
}
