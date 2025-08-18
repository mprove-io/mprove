import { Body, Controller, Logger, Post, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { apiToDisk } from '~disk/barrels/api-to-disk';
import { makeErrorResponseDisk } from '~disk/functions/make-error-response-disk';
import { makeOkResponseDisk } from '~disk/functions/make-ok-response-disk';
import { Config } from '~disk/interfaces/config';
import { GetCatalogNodesService } from './get-catalog-nodes.service';

@Controller()
export class GetCatalogNodesController {
  constructor(
    private cs: ConfigService<Config>,
    private getCatalogNodesService: GetCatalogNodesService,
    private logger: Logger
  ) {}

  @Post(apiToDisk.ToDiskRequestInfoNameEnum.ToDiskGetCatalogNodes)
  async getCatalogNodes(@Req() request: any, @Body() body: any) {
    let startTs = Date.now();
    try {
      let payload = await this.getCatalogNodesService.process(body);

      return makeOkResponseDisk({
        body: body,
        payload: payload,
        path: request.url,
        method: request.method,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseDisk({
        body: body,
        e: e,
        path: request.url,
        method: request.method,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
