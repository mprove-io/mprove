import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskGetCatalogFilesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-files/get-catalog-files-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { GetCatalogFilesService } from './get-catalog-files.service';

@Controller()
export class GetCatalogFilesController {
  constructor(
    private getCatalogFilesService: GetCatalogFilesService,
    private logger: Logger
  ) {}

  @Post('getCatalogFiles')
  async getCatalogFiles(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskGetCatalogFilesResponse> {
    let response: ToDiskGetCatalogFilesResponse = await handleHttpRequest({
      operation: 'getCatalogFiles',
      body: body,
      method: request.method,
      process: input => this.getCatalogFilesService.process(input),
      logger: this.logger
    });

    return response;
  }
}
