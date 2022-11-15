import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { ProcessQueryService } from '~blockml/controllers/process-query/process-query.service';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';
import { makeErrorResponseBlockml } from '~blockml/functions/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/make-ok-response-blockml';

let pathProcessQuery = common.RabbitBlockmlRoutingEnum.ProcessQuery.toString();
let pathRebuildStruct =
  common.RabbitBlockmlRoutingEnum.RebuildStruct.toString();

@Injectable()
export class ConsumerMainService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private structService: RebuildStructService,
    private queryService: ProcessQueryService,
    private logger: Logger
  ) {}

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: pathProcessQuery,
    queue: pathProcessQuery
  })
  async processQuery(request: any, context: any) {
    let startTs = Date.now();
    try {
      let payload = await this.queryService.process(request);

      return makeOkResponseBlockml({
        body: request,
        payload: payload,
        path: pathProcessQuery,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        body: request,
        e: e,
        path: pathProcessQuery,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: pathRebuildStruct,
    queue: pathRebuildStruct
  })
  async rebuildStruct(request: any, context: any) {
    let startTs = Date.now();
    try {
      let payload = await this.structService.rebuild(request);

      return makeOkResponseBlockml({
        payload: payload,
        body: request,
        path: pathRebuildStruct,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        e: e,
        body: request,
        path: pathRebuildStruct,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
