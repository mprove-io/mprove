import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import type { ToDiskMoveCatalogNodeResponse } from '#common/zod/to-disk/04-catalogs/move-catalog-node/move-catalog-node-response';
import { handleHttpRequest } from '#disk/functions/handle-http-request';
import { MoveCatalogNodeService } from './move-catalog-node.service';

@Controller()
export class MoveCatalogNodeController {
  constructor(
    private moveCatalogNodeService: MoveCatalogNodeService,
    private logger: Logger
  ) {}

  @Post('moveCatalogNode')
  async moveCatalogNode(
    @Req() request: { method: string },
    @Body() body: unknown
  ): Promise<ToDiskMoveCatalogNodeResponse> {
    let response: ToDiskMoveCatalogNodeResponse = await handleHttpRequest({
      operation: 'moveCatalogNode',
      body: body,
      method: request.method,
      process: input => this.moveCatalogNodeService.process(input),
      logger: this.logger
    });

    return response;
  }
}
