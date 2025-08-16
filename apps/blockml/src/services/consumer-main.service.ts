import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';
import { GetTimeRangeService } from '~blockml/controllers/get-time-range/get-time-range.service';
import { RebuildStructService } from '~blockml/controllers/rebuild-struct/rebuild-struct.service';
import { makeErrorResponseBlockml } from '~blockml/functions/make-error-response-blockml';
import { makeOkResponseBlockml } from '~blockml/functions/make-ok-response-blockml';

let pathProcessQuery = common.RabbitBlockmlRoutingEnum.ProcessQuery.toString();
let pathGetTimeRange = common.RabbitBlockmlRoutingEnum.GetTimeRange.toString();
let pathGetFractions = common.RabbitBlockmlRoutingEnum.GetFractions.toString();

let pathRebuildStruct =
  common.RabbitBlockmlRoutingEnum.RebuildStruct.toString();

@Injectable()
export class ConsumerMainService {
  constructor(
    private cs: ConfigService<interfaces.Config>,
    private rebuildStructService: RebuildStructService,
    private getTimeRangeService: GetTimeRangeService,
    private logger: Logger
  ) {}

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: pathRebuildStruct,
    queue: pathRebuildStruct
  })
  async rebuildStruct(request: any, context: any) {
    let startTs = Date.now();
    try {
      let payload = await this.rebuildStructService.rebuild(request);

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

  @RabbitRPC({
    exchange: common.RabbitExchangesEnum.Blockml.toString(),
    routingKey: pathGetTimeRange,
    queue: pathGetTimeRange
  })
  async getTimeRange(request: any, context: any) {
    let startTs = Date.now();
    try {
      let payload = await this.getTimeRangeService.get(request);

      return makeOkResponseBlockml({
        body: request,
        payload: payload,
        path: pathGetTimeRange,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    } catch (e) {
      return makeErrorResponseBlockml({
        body: request,
        e: e,
        path: pathGetTimeRange,
        method: common.METHOD_RABBIT,
        duration: Date.now() - startTs,
        cs: this.cs,
        logger: this.logger
      });
    }
  }
}
