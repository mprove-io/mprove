import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import type { ToDiskGetCatalogNodesResponse } from '#common/zod/to-disk/04-catalogs/get-catalog-nodes/get-catalog-nodes-response';
import { processResponse } from '#disk/functions/process-response';
import { GetCatalogNodesService } from './get-catalog-nodes.service';

@Controller()
export class GetCatalogNodesController {
  constructor(
    private getCatalogNodesService: GetCatalogNodesService,
    private logger: Logger
  ) {}

  @Post(ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes)
  async getCatalogNodes(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskGetCatalogNodesResponse> {
    let response: ToDiskGetCatalogNodesResponse = await processResponse({
      name: 'ToDiskGetCatalogNodes',
      body: body,
      method: request.method,
      process: input => this.getCatalogNodesService.process(input),
      logger: this.logger
    });

    return response;
  }
}
