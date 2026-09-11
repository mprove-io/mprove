import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskGetCatalogFilesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-response';
import { processResponse } from '#disk/functions/process-response';
import { GetCatalogFilesService } from './get-catalog-files.service';

@Controller()
export class GetCatalogFilesController {
  constructor(
    private getCatalogFilesService: GetCatalogFilesService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskGetCatalogFiles)
  async getCatalogFiles(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskGetCatalogFilesResponse> {
    let response: ToDiskGetCatalogFilesResponse = await processResponse({
      name: 'ToDiskGetCatalogFiles',
      body: body,
      method: request.method,
      process: input => this.getCatalogFilesService.process(input),
      logger: this.logger
    });

    return response;
  }
}
