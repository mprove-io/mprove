import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskGetCatalogNodesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { GetCatalogNodesService } from './get-catalog-nodes.service';

@Controller()
export class GetCatalogNodesController {
  constructor(
    private getCatalogNodesService: GetCatalogNodesService,
    private logger: Logger
  ) {}

  @Post('getCatalogNodes')
  async getCatalogNodes(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskGetCatalogNodesResponse> {
    let response: ToDiskGetCatalogNodesResponse = await handleHttpRequest({
      operation: 'getCatalogNodes',
      body: body,
      method: request.method,
      process: input => this.getCatalogNodesService.process(input),
      logger: this.logger
    });

    return response;
  }
}
